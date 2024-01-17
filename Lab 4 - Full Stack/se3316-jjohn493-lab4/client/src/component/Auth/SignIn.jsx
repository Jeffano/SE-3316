import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // Importing Firebase authentication module
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
    const navigate = useNavigate(); // Hook for navigation using react-router-dom
    const [email, setEmail] = useState(''); // State for storing the email
    const [password, setPassword] = useState(''); // State for storing the password
    const [message, setMessage] = useState(''); // State for storing messages for the user
    const [isSignedIn, setIsSignedIn] = useState(false); // State to track if the user is signed in

    // Function to validate email and password input fields
    const validateFields = () => {
        if (!email.trim()) {
            setMessage('Please enter an email.');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setMessage('Please enter a valid email.');
            return false;
        }
        if (!password.trim()) {
            setMessage('Password field is empty.');
            return false;
        }
        return true;
    };

    // Function to handle the sign-in process
    const signIn = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        if (!validateFields()) return; // Check if fields are valid before proceeding

        // Firebase function to sign in the user
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Checking if the user's email is verified
                if (!userCredential.user.emailVerified) {
                    setMessage('Your email has not been verified. Please check your email for a verification link to sign in.');
                    setIsSignedIn(false);
                    await signOut(auth); // Sign out if the email isn't verified
                } else {
                    // Make a fetch request to check the user's status
                    fetch(`http://localhost:3001/api/admin/checkStatus/${email}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to check user status');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.status === 'Disabled') {
                            throw new Error('User is Disabled, Please Contact Admin');
                        }
                        setIsSignedIn(true);
                        setMessage('Successfully Signed In');

                        // Navigate to different routes based on the user's email
                        email.toLowerCase() === 'jeffanojohn@gmail.com' ? navigate('/admin') : navigate('/dashboard', { state: { email: email } });

                        // Update user data in the backend with JWT token
                        return fetch('http://localhost:3001/api/secure/updateCollection', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${userCredential.user.getIdToken()}`
                            },
                            body: JSON.stringify({ email, token: userCredential.user.getIdToken() })
                        });
                    })
                    .then(updateResponse => {
                        if (!updateResponse.ok) {
                            throw new Error('Failed to update user data');
                        }
                        return updateResponse.json();
                    })
                    .then(updateData => {
                        console.log('User data updated:', updateData);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        setMessage(error.message);
                        setIsSignedIn(false);
                        signOut(auth); // Sign out the user if there is an error
                    });
                }
            })
            .catch((error) => {
                // Handle various sign-in errors
                switch (error.code) {
                    case 'auth/user-not-found':
                        setMessage('Email does not exist.');
                        break;
                    case 'auth/wrong-password':
                        setMessage('Incorrect password.');
                        break;
                    default:
                        setMessage('Failed to sign in.');
                        break;
                }
            });
    };

    // Function to handle user sign-out
    const userSignOut = () => {
        signOut(auth).then(() => {
            setIsSignedIn(false);
            setMessage('Signed out successfully');
        }).catch(error => {
            console.error(error);
            setMessage('Failed to sign out');
        });
    }

    return (
        <div className='sign-in-container'>
            {!isSignedIn ? (
                // Display sign-in form when the user is not signed in
                <form onSubmit={signIn}>
                    <h1>Log In</h1>
                    <input
                        type='email'
                        placeholder='Enter Email'
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setMessage(''); // Clear message when the user starts typing
                        }}
                    />
                    <input
                        type='password'
                        placeholder='Enter Password'
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setMessage(''); // Clear message when the user starts typing
                        }}
                    />
                    <button type="submit">Log In</button>
                </form>
            ) : (
                // Display sign-out option when the user is signed in
                <div>
                    <p>{`Signed in as ${email}`}</p>
                    <button onClick={userSignOut}>Log Out</button>
                </div>
            )}
            {/* Display any messages to the user */}
            <div className='message'>{message}</div>
        </div>
    );
}

export default SignIn;
