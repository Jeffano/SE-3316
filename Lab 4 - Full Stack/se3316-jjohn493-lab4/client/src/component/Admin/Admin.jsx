import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const navigate = useNavigate(); // Hook to navigate to different routes

    // Fetch all user emails when the component mounts
    useEffect(() => {
        // Fetch request to get all user emails
        fetch(`http://localhost:3001/api/admin/getEmails`)
            .then(response => response.json())
            .then(data => {
                const emails = data.emails;
                const dropDown = document.getElementById("listOption");
    
                // Clear existing options in the dropdown
                dropDown.innerHTML = '';
    
                // Populate the dropdown with fetched emails
                emails.forEach(email => {
                    let option = document.createElement("option");
                    option.textContent = email;
                    option.value = email;
                    dropDown.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    // Function to update user status based on selected operation
    const updateUserStatus = (email, path) => {
        fetch(`http://localhost:3001/api/admin/${path}/${email}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Operation successful!');
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    // Handler for button clicks to perform user status operations
    const handleButtonClick = (operation) => {
        const email = document.getElementById('listOption').value;
        let path = '';

        // Determine the API path based on the operation
        switch(operation) {
            case 'enable':
                path = 'enableUser';
                break;
            case 'disable':
                path = 'disableUser';
                break;
            case 'addSuperAdmin':
                path = 'addSuperAdminUser';
                break;
            case 'removeSuperAdmin':
                path = 'removeSuperAdminUser';
                break;
            default:
                console.error('Invalid operation');
                return;
        }

        // Call function to update user status
        updateUserStatus(email, path);
    };

    // Function to handle sign-out
    const handleSignOut = () => {
        navigate('/'); // Navigate back to the landing page
    };

    return (
        <div className="user-home-page">
            <h1>Admin Home Page</h1>
            <header className="App-header">
                {/* Dropdown for selecting a user */}
                <select id="listOption"></select>
            </header>
            <div className="control-buttons">
                {/* Buttons for various user operations */}
                <button onClick={() => handleButtonClick('enable')}>Enable User</button>
                <button onClick={() => handleButtonClick('disable')}>Disable User</button>
                <button onClick={() => handleButtonClick('addSuperAdmin')}>Add SuperAdmin</button>
                <button onClick={() => handleButtonClick('removeSuperAdmin')}>Remove SuperAdmin</button>
                <button onClick={handleSignOut}>Sign Out</button> {/* Sign Out button */}
            </div>
        </div>
    );
}

export default Admin;
