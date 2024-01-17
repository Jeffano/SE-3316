import React, { useState, useEffect } from "react";
import { auth } from "../../firebase"; // Assuming firebase.js is directly under src
import { onAuthStateChanged, signOut } from "firebase/auth";
import SignIn from "../Auth/SignIn";
import SignUp from "../Auth/SignUp";
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [authUser, setAuthUser] = useState(null);
    const [showComponent, setShowComponent] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.emailVerified) {
                setAuthUser(user); // Set user only if email is verified
            } else {
                setAuthUser(null); // Not authenticated or email not verified
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignUpSuccess = () => {
        setShowComponent(null); // Resets to show the initial landing page view
    };

    const handleGuestSignIn = () => {
        navigate('/dashboard'); // Navigate to the dashboard route
    };

    return (
        <div className="LandingPage">
            <div className="header">
                <h1>Welcome To Superhero Lists</h1>
            </div>
            <div className="about">
                <p>Welcome! The ultimate platform for superhero enthusiasts! Dive into a community where you can create a personal account to curate your own lists of favorite heroes. Join to celebrate your passion, connect with others, and contribute to the ever-expanding universe of superheroes</p>
            </div>
            <div className="LandingPage">
                <div>
                    <button type="button" onClick={() => setShowComponent('signIn')}>Sign In</button>
                    <button type="button" onClick={() => setShowComponent('signUp')}>Sign Up</button>
                    <button type="button" onClick={handleGuestSignIn}>Sign In as Guest</button>
                </div>
                <main className="LandingPage-main">
                    {showComponent === 'signIn' && <SignIn />}
                    {showComponent === 'signUp' && <SignUp onSignUpSuccess={handleSignUpSuccess} />}
                </main>
            </div>
        </div>
    );
};

export default LandingPage;
