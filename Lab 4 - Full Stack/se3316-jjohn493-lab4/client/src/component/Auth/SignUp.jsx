import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './SignInUp.css';

const SignUp = ({ onSignUpSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const isValidEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const isValidPassword = (password) => {
        return password.length >= 6;
    };

    const signUp = (e) => {
        e.preventDefault();
        setError('');

        // Input validation
        if (!username) {
            setError('Please enter a username.');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!isValidPassword(password)) {
            setError('Password must be at least 6 characters.');
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Additional checks and operations
                if (!userCredential.user.emailVerified) {
                    await sendEmailVerification(userCredential.user);
                    console.log('Verification email sent.');

                    await signOut(auth);

                    // Fetch request to save user data
                    fetch('http://localhost:3001/api/secure/accessCollection', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userEmail: email, userName: username })
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log('User data saved:', data);
                            onSignUpSuccess();
                        })
                        .catch(error => {
                            console.error('Error saving user data:', error);
                            setError('Failed to save user data.');
                        });
                }
            })
            .catch((error) => {
                // Handling different types of errors
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        setError('Email already exists. Please use a different email.');
                        break;
                    case 'auth/weak-password':
                        setError('The password is too weak.');
                        break;
                    default:
                        setError('An error occurred during sign up. Please try again.');
                        break;
                }
                console.log(error);
            });
    }

    return (
        <div className='sign-up-container'>
            <form onSubmit={signUp}>
                <h1>Create Account</h1>
                {error && <p className="error-message">{error}</p>}
                <input
                    type='text'
                    placeholder='Username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default SignUp;
