import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const SuperheroMatcher = () => {
    const [fieldOptions, setFieldOptions] = useState('-');
    const [patternChoice, setPatternChoice] = useState('');
    const [countChoice, setCountChoice] = useState('');
    const [matches, setMatches] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const displayMatches = (data) => {
        if (data === 0) {
            setMatches([]);
            setMessage('No Matches Found');
        } else if (Array.isArray(data) && data.length > 0) {
            setMatches(data);
            setMessage('Matches Found');
        } else {
            setMatches([]);
            setMessage('No Matches Available');
        }
    };

    const findMatches = () => {
        if (fieldOptions === "-" || patternChoice === "") {
            setError('Please Enter All Fields');
            setMatches([]);
            return;
        }

        const count = countChoice || 1000;
        setError('');
        setMessage('');

        fetch(`http://localhost:3001/api/superheroes/match/${fieldOptions}/${encodeURIComponent(patternChoice)}/${count}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                displayMatches(data);
            })
            .catch(error => {
                console.error('Fetch error:', error);
                setError('Fetch error: ' + error.message);
            });
    };

    return (
        <div className="superhero-matches">
            <h1 className="sub-headings">Find Matches</h1>
            <div className="mini-section-2">
                <label>Find Matches:</label>
                <select id="match-dropdown" value={fieldOptions} onChange={(e) => setFieldOptions(e.target.value)}>
                    <option value="-">-</option>
                    <option value="name">Name</option>
                    <option value="Race">Race</option>
                    <option value="Publisher">Publisher</option>
                    <option value="Skin color">Skin color</option>
                    <option value="Alignment">Alignment</option>
                    <option value="Weight">Weight</option>
                </select>

                <label> Enter Pattern:</label>
                <input className='input-boxes' type="text" id="pattern" value={patternChoice} onChange={(e) => setPatternChoice(e.target.value)} />

                <label>Enter Count:</label>
                <input className='input-boxes' type="text" id="count" value={countChoice} onChange={(e) => setCountChoice(e.target.value)} />
            </div>

            <div className="mini-section-2">
    <button onClick={findMatches}>ENTER MATCH</button>
</div>
<div className="output-message">
    {error && <label style={{ color: '#000000' }}>{error}</label>}
    {message && <label style={{ color: '#000000' }}>{message}</label>}
    {matches.length > 0 && (
        <div className="display-box">
            {matches.map((superhero, index) => (
                <div key={index}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#000000' }}>
                        Superhero {index + 1}
                    </div>
                    {Object.entries(superhero).map(([key, value]) => (
                        <span key={key} style={{ color: '#000000' }}>
                            {key}: {value}<br />
                        </span>
                    ))}
                    <hr style={{ marginTop: '10px', marginBottom: '10px', color: '#000000' }} />
                </div>
            ))}
        </div>
    )}
</div>

        </div>
    );
};

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email; // Get the email passed via state
    const [userName, setUserName] = useState(''); // State to store the username

    useEffect(() => {
        // Check if email is present
        if (email) {
            fetch(`http://localhost:3001/api/secure/getUsername/${email}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Include other headers if required, like authentication tokens
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Update the state with the retrieved username
                    setUserName(data.userName);
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
    }, [email]); // Dependency array to ensure effect runs only when email changes
    // Dependency array to ensure effect runs only when email changes

    const handleSignOut = () => {
        // Add any sign-out logic here if needed
        navigate('/'); // Navigate back to the Landing page
    };

    return (
        <div>
            <h1>Dashboard</h1>
            {userName && <p>Signed in as: {userName}</p>}
            {email && <button onClick={handleSignOut}>Sign Out</button>}
            {/* Superhero Matcher Component */}
            <SuperheroMatcher />
        </div>
    );
};

export default Dashboard;
