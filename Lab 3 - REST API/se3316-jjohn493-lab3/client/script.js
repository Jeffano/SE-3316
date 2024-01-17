document.addEventListener('DOMContentLoaded', (event) => {


    const intID = document.getElementById('id');
    const idConfirmation = document.getElementById('id-confirmation');

    const optMatches = document.getElementById('match-dropdown');
    const txtPattern = document.getElementById('pattern');
    const intCount = document.getElementById('count');
    const matchesConfirmation = document.getElementById('matches-confirmation');

    const txtListName = document.getElementById('list-name');
    const superheroIDS = document.getElementById('superhero-id-list');
    const optListOptionsIDS = document.getElementById('list-dropdowns-ids');
    const optListOptionsShowIDS = document.getElementById('list-dropdowns-show-ids');
    const optListOptionsShowInformation = document.getElementById('list-dropdowns-show-information');
    const optListOptionsSort = document.getElementById('list-dropdowns-sort');
    const dropdownArrays = [optListOptionsIDS, optListOptionsShowIDS, optListOptionsShowInformation, optListOptionsSort];
    updateLists(dropdownArrays);
    const optSortOptions = document.getElementById('sort-options-dropdown')
    const listConfirmation = document.getElementById('list-confirmation-message');



    const optSearchOptions = document.getElementById('search-options-dropdown')
    const txtSearchItem = document.getElementById('search-item')
    const optSearchSortOptions = document.getElementById('search-sort-options-dropdown')

    document.getElementById('find-superhero').addEventListener('click', findSuperhero);
    document.getElementById('find-powers').addEventListener('click', findPowers);
    document.getElementById('find-publishers').addEventListener('click', findPublishers);

    document.getElementById('find-matches').addEventListener('click', findMatches);

    document.getElementById('create-list').addEventListener('click', createList);
    document.getElementById('delete-list').addEventListener('click', deleteList);
    document.getElementById('refresh-list').addEventListener('click', refreshList);

    document.getElementById('add-superhero').addEventListener('click', addListToCollection)
    document.getElementById('show-ids').addEventListener('click', showListIDs);
    document.getElementById('show-superheros').addEventListener('click', showListInformation);
    document.getElementById('sort-information').addEventListener('click', sortListInformation);

    document.getElementById('search-info').addEventListener('click', searchInformation);
    document.getElementById('sort-superheroes').addEventListener('click', sortInformation);

    let globalSuperheroData;

    intID.addEventListener("input", function () {
        outputText = document.createTextNode("");
        idConfirmation.textContent = outputText.textContent;
        validateInput(this);
    });

    intCount.addEventListener("input", function () {
        outputText = document.createTextNode("");
        idConfirmation.textContent = outputText.textContent;
        validateInput(this);
    });

    txtPattern.addEventListener("input", function () {
        // Clear confirmation text
        idConfirmation.textContent = "";

        const optionChoice = optMatches.value;
        const inputText = txtPattern.value;

        if (optionChoice === "Height" || optionChoice === "Weight") {
            // Allow numeric values and '-' sign only
            const numericRegex = /^[0-9-]*$/;
            if (!numericRegex.test(inputText)) {
                // If input is not numeric or '-' sign, clear the input
                txtPattern.value = inputText.slice(0, -1);
                matchesConfirmation.textContent = "Please enter only numeric values";
            }
        } else {
            // Allow alphabetic characters only
            const alphaRegex = /^[a-zA-Z]*$/;
            if (!alphaRegex.test(inputText)) {
                // If input is not alphabetic, clear the input
                txtPattern.value = inputText.slice(0, -1);
                matchesConfirmation.textContent = "Please enter only alphabetic characters.";
            }
        }
    });

    superheroIDS.addEventListener('input', function (event) {
        // Get the input value
        const inputValue = event.target.value;

        // Remove any non-numeric characters and spaces
        const cleanedValue = inputValue.replace(/[^0-9,]/g, '');

        // Update the input value with the cleaned value
        event.target.value = cleanedValue;
    });

    function validateInput(inputElement) {
        const inputValue = inputElement.value;
        const numericValue = inputValue.replace(/[^0-9]/g, '');
        const truncatedValue = numericValue.slice(0, 5);
        inputElement.value = truncatedValue;
    }

    // Define a function for the first button
    function findSuperhero() {
        const superheroID = parseInt(intID.value);

        // Check if superheroID is a valid positive integer
        if (!isNaN(superheroID) && superheroID > 0 && superheroID <= 734) { // Example: Limiting the ID to a reasonable range (1 to 10,000)
            const encodedSuperheroID = encodeURIComponent(superheroID);

            fetch(`/api/superheroes/${encodedSuperheroID}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(superheroData => {
                    displayOutput(superheroData);
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });

            outputText = document.createTextNode(`Superhero Information for ID: ${superheroID} Found.`);
            idConfirmation.textContent = outputText.textContent;
        } else {
            // Display an alert if superheroID is not a valid positive integer
            outputText = document.createTextNode('Please Enter a Valid Numeric Value (1 to 734).');
            idConfirmation.textContent = outputText.textContent;
        }
    }

    // Function to find powers for a specific superhero by ID
    function findPowers() {
        const superheroID = intID.value
        // Check if superheroID is a valid number
        if (!isNaN(superheroID) && superheroID > 0 && superheroID <= 1000) {
            const encodedSuperheroID = encodeURIComponent(superheroID);
            fetch(`/api/superheroes/${encodedSuperheroID}/powers`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(powerData => {
                    displayOutput(powerData)
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });

            outputText = document.createTextNode(`Powers for Superhero ID:${superheroID} Found.`);
            idConfirmation.textContent = outputText.textContent;
        } else {
            outputText = document.createTextNode('Please Enter a Valid Numeric Value (1 to 734).');
            idConfirmation.textContent = outputText.textContent;
        }
    }

    // Define a function for the third button
    function findPublishers() {
        fetch('/api/superheroes/publishers')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(publisherData => {
                displayOutput(publisherData)
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
        outputText = document.createTextNode('Publishers Found');
        idConfirmation.textContent = outputText.textContent;
    }

    function findMatches() {
        fieldOptions = optMatches.value
        patternChoice = txtPattern.value
        countChoice = intCount.value

        if (fieldOptions == "-" || patternChoice == "") {
            outputText = document.createTextNode('Please Enter All Fields');
            matchesConfirmation.textContent = outputText.textContent;
            // Clear the display-box
            document.getElementById("display-box").textContent = '';
        } else if (countChoice == "") {
            countChoice = 1000;
            fetch(`/api/superheroes/match/${fieldOptions}/${encodeURIComponent(patternChoice)}/${countChoice}`)
                .then(res => {
                    if (!res.ok) {
                        displayMatches(res)
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(matchesData => {
                    displayMatches(matchesData);
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });
        } else {
            fetch(`/api/superheroes/match/${fieldOptions}/${encodeURIComponent(patternChoice)}/${countChoice}`)
                .then(res => {
                    if (!res.ok) {
                        displayMatches(res)
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(matchesData => {
                    displayMatches(matchesData);
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });
        }
    }

    function createList() {
        const collectionName = txtListName.value;
        const encodedCollectionName = encodeURIComponent(collectionName);

        // Check if the collectionName is not empty
        if (encodedCollectionName.trim() === '') {
            outputText = document.createTextNode('Please Enter A Collection Name');
            listConfirmation.textContent = outputText.textContent;
            return;
        }

        fetch(`/api/superheroes/${encodedCollectionName}`, {
            method: 'POST',
        })
            .then(res => {
                if (res.status === 201) {
                    // Collection created successfully
                    outputText = document.createTextNode(`List Has Been Created.`);
                    listConfirmation.textContent = outputText.textContent;
                    txtListName.value = '';
                } else if (res.status === 409) {
                    // Collection already exists
                    outputText = document.createTextNode(`List Name is already in use. Please Enter A New Message`);
                    listConfirmation.textContent = outputText.textContent;
                } else {
                    // Handle other response statuses as needed
                    alert('An error occurred while creating the collection.');
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

    function refreshList(){
        updateLists(dropdownArrays);
    }

    function deleteList() {
        const collectionName = txtListName.value;
        const encodedCollectionName = encodeURIComponent(collectionName);

        // Check if the collectionName is not empty
        if (encodedCollectionName.trim() === '') {
            outputText = document.createTextNode('Please Enter A Collection Name');
            listConfirmation.textContent = outputText.textContent;
            return;
        }

        fetch(`/api/superheroes/${encodedCollectionName}`, {
            method: 'DELETE',
        })
            .then(res => {
                if (res.status === 200) {
                    // Collection deleted successfully
                    outputText = document.createTextNode(`List has been deleted.`);
                    listConfirmation.textContent = outputText.textContent;
                    txtListName.value = '';
                } else if (res.status === 404) {
                    // Collection not found (standard status code for "Not Found")
                    outputText = document.createTextNode(`List does not exist.`);
                    listConfirmation.textContent = outputText.textContent;
                } else {
                    // Handle other response statuses as needed
                    alert('An error occurred while deleting the collection.');
                }
                updateLists(dropdownArrays);
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

    function updateLists(collectionArray) {
        collectionArray.forEach(selectElement => {
            fetch('api/superheroes/collections/names')
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(collections => {
                    // Filter out names starting with "superhero"
                    const filteredCollections = collections.filter(collectionName => !collectionName.startsWith('Superhero'));

                    // Clear existing options once for each select element
                    selectElement.innerHTML = '';

                    // Add filtered collection names as options
                    filteredCollections.forEach(collectionName => {
                        const option = document.createElement('option');
                        option.value = collectionName;
                        option.textContent = collectionName;
                        selectElement.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });
        });

    }

    function addListToCollection() {
        const selctedList = optListOptionsIDS.value;
        const selectedIDs = superheroIDS.value;

        // Use a regular expression to check for multiple consecutive commas
        if (selectedIDs.match(/,,+/)) {
            // Handle the case where multiple consecutive commas are found
            outputText = document.createTextNode(`Multiple consecutive commas detected.`);
            listConfirmation.textContent = outputText.textContent;
            return; // Exit the function to prevent further processing
        }

        // Remove any leading or trailing spaces
        const trimmedInput = selectedIDs.trim();

        // Check if the trimmed input is empty or contains only commas
        if (trimmedInput === '' || trimmedInput === ',') {
            outputText = document.createTextNode(`No Numbers Entered`);
            listConfirmation.textContent = outputText.textContent;
            return; // Exit the function to prevent further processing
        }

        // Split the trimmed, non-empty input by commas and convert to an array of numbers
        const idArray = trimmedInput.split(',').map(Number).filter(Number.isFinite);

        if (idArray.some(isNaN)) {
            // Handle the case where non-numeric values are detected in the input
            outputText = document.createTextNode(`Invalid input: Non-numeric values detected.`);
            listConfirmation.textContent = outputText.textContent;
        } else {
            fetch(`/api/superheroes/${selctedList}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(idArray)
            })
                .then((response) => {
                    if (!response.ok) {
                        throw Error('Network response was not ok');
                    }
                    return response.json(); // Parse the response as JSON if needed
                })
                .then((responseData) => {
                    // Handle the response data
                    console.log('Response data:', responseData);

                })
                .catch((error) => {
                    // Handle errors
                    console.error('Error:', error);
                });
            updateLists(dropdownArrays);
            outputText = document.createTextNode(`List Updated`);
            listConfirmation.textContent = outputText.textContent;
        }
    }

    function showListIDs() {
        textCollectionName = optListOptionsShowIDS.value;
        fetch(`/api/superheroes/${textCollectionName}/ids`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(collectionIDS => {
                displayOutput(collectionIDS)
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
        outputText = document.createTextNode(`List IDs Displayed`);
        listConfirmation.textContent = outputText.textContent;
    }

    function showListInformation() {
        textCollectionName = optListOptionsShowIDS.value;
        fetch(`/api/superheroes/${textCollectionName}/information`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(collectionInformation => {
                displayMatches(collectionInformation)
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
        outputText = document.createTextNode(`List Information Sorted`);
        listConfirmation.textContent = outputText.textContent;
    }

    function searchInformation() {
        const options = optSearchOptions.value;
        const searchItem = txtSearchItem.value;


        if (options == "Name") {
            searchSuperhero(searchItem);

        } else if (options == "Race") {
            searchRace(options, searchItem);

        } else if (options == "Publisher") {
            searchPublisher(options, searchItem)

        } else if (options == "Power") {
            searchPower(searchItem);

        } else {
            alert("Please Select A Search Option");
        }
    }

    function sortListInformation() {
        const collectionName = optListOptionsSort.value;
        const sortOption = optSortOptions.value;

        fetch(`/api/superheroes/${collectionName}/information`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(collectionInformation => {
                // Adjust the property to sort by based on the option selected by the user
                let sortProperty = '';
                switch (sortOption) {
                    case 'Name':
                        sortProperty = 'name';
                        break;
                    case 'Race':
                        sortProperty = 'Race'; // Assuming the property name in the data is 'Race' with a capital 'R'
                        break;
                    case 'Publisher':
                        sortProperty = 'Publisher'; // Assuming the property name in the data is 'Publisher'
                        break;
                    case 'Power':
                        // When sorting by power, count and compare the number of 'True' power properties.
                        collectionInformation.forEach(hero => {
                            let powerProperties = Object.keys(hero).slice(Object.keys(hero).indexOf('Weight') + 1);
                            hero.powerCount = powerProperties.reduce((count, power) => hero[power] === "True" ? count + 1 : count, 0);
                        });

                        // Now sort based on the powerCount.
                        collectionInformation.sort((a, b) => b.powerCount - a.powerCount);
                        // No need to continue to the default sort since we've done a custom sort above.
                        displayMatches(collectionInformation);
                        return;
                }

                // Sort the collection based on the determined property
                collectionInformation.sort((a, b) => {
                    let valA = a[sortProperty] ? a[sortProperty].toString().toLowerCase() : '';
                    let valB = b[sortProperty] ? b[sortProperty].toString().toLowerCase() : '';
                    // Sort alphabetically, taking care to handle missing or non-string data
                    return valA.localeCompare(valB);
                });

                displayMatches(collectionInformation);
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

    async function searchSuperhero(item) {
        try {
            const res = await fetch(`/api/superheroes/superheroname/${item}`);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
                
            }
            const data = await res.json();
            const output = await Promise.all(data.map(async (hero) => {
                try {
                    const powersRes = await fetch(`/api/superheroes/${hero.id}/powers`);

                    // Even if the response is not ok, we still try to parse it to check for a "message"
                    const powersData = await powersRes.json();
                    if (!powersRes.ok) {
                        // If there's a message in the response, use it, otherwise throw an error
                        if (powersData.message) {
                            return { ...hero, Powers: 'No Powers Available' }; // Handles the "no powers" case
                        } else {
                            throw new Error('Network response was not ok');
                        }
                    }
                    return { ...hero, Powers: powersData };
                } catch (error) {
                    console.error('Fetch error for individual hero:', error);
                    return { ...hero, Powers: 'No Powers Available' }; // If an error occurs during the fetch
                }
            }));
            globalSuperheroData = output;
            displaySearchResults(output);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    function searchRace(key, item) {
        fetch(`/api/superheroes/match/${key}/${item}/1000`)
            .then(res => {
                if (!res.ok) {
                    displaySearchResults(res);
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                const outputPromises = data.map((hero) => {
                    const id = hero.id;

                    return fetch(`/api/superheroes/${id}/powers`)
                        .then(powersRes => powersRes.json().then(powersData => {
                            if (powersRes.ok) {
                                return { ...hero, Powers: powersData };
                            } else {
                                if (powersData.message) {
                                    return { ...hero, Powers: 'No Powers Available' }; // If the API says there are no powers
                                } else {
                                    throw new Error(`Error fetching powers: ${powersData.message}`);
                                }
                            }
                        }))
                        .catch(error => {
                            // Catch errors specifically from the powers fetch, log it and return the hero without powers data.
                            console.error('Error fetching powers for hero:', hero.id, error);
                            return { ...hero, Powers: 'No Powers Available' };
                        });
                });

                return Promise.all(outputPromises);
            })
            .then((output) => {
                globalSuperheroData = output;
                displaySearchResults(output);
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

    function searchPublisher(key, item) {
        fetch(`/api/superheroes/match/${key}/${item}/1000`)
            .then(res => {
                if (!res.ok) {
                    displaySearchResults(res);
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                const outputPromises = data.map((hero) => {
                    const id = hero.id;

                    return fetch(`/api/superheroes/${id}/powers`)
                        .then(powersRes => powersRes.json().then(powersData => {
                            if (powersRes.ok) {
                                return { ...hero, Powers: powersData };
                            } else {
                                // Here we're checking for the 'message' field in the response body to handle the case of no powers
                                return { ...hero, Powers: powersData.message ? 'No Powers Available' : powersData };
                            }
                        }))
                        .catch(error => {
                            // Log the error and return the hero without powers data
                            console.error('Error fetching powers for hero:', hero.id, error);
                            return { ...hero, Powers: 'No Powers Available' };
                        });
                });

                return Promise.all(outputPromises);
            })
            .then((output) => {
                globalSuperheroData = output;
                displaySearchResults(output);
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

    function searchPower(item) {
        fetch(`/api/superheroes/`)
            .then((response) => {
                if (!response.ok) {
                    displaySearchResults(res);
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((heroes) => {
                // Map over heroes to create an array of promises
                const promises = heroes.map((hero) => {
                    return fetch(`/api/superheroes/${hero.id}/powers`)
                        .then((res) => {
                            if (!res.ok) {
                                throw new Error(`Error fetching powers for hero with ID: ${hero.id}`);
                            }
                            return res.json();
                        })
                        .then((powersObj) => {
                            // Convert the search term to lowercase for case-insensitive comparison
                            const searchTerm = item.toLowerCase();

                            // Find if any power includes the search term (partial match, case-insensitive)
                            const powerMatch = Object.keys(powersObj).some(
                                (power) => power.toLowerCase().startsWith(searchTerm)
                            );

                            // If a match is found, return the hero with their powers
                            if (powerMatch) {
                                return { ...hero, Powers: powersObj };
                            }
                            // If not, return null to filter this hero out later
                            return null;
                        })
                        .catch((error) => {
                            console.error('Error fetching powers for hero:', hero.id, error);
                            // In case of an error, consider that the hero does not have the power
                            return null;
                        });
                });

                // Wait for all promises to resolve
                return Promise.all(promises);
            })
            .then((heroesWithPowers) => {
                // Filter out heroes who didn't have the power (null values)
                const filteredHeroes = heroesWithPowers.filter((hero) => hero !== null);

                globalSuperheroData = filteredHeroes;
                // Now you have an array of heroes with the searched power (including partial matches)
                displaySearchResults(filteredHeroes);
            })
            .catch((error) => {
                console.error('Fetch error:', error);
            });
    }

    function sortInformation() {
        const sortOption = optSearchSortOptions.value;

        


        if (sortOption == "Name") {
            const sortedSuperheroes = sortSuperheroesByName(globalSuperheroData);
            displaySearchResults(sortedSuperheroes);

        } else if (sortOption == "Race") {
            const sortedSuperheroes = sortSuperheroesByRace(globalSuperheroData);
            displaySearchResults(sortedSuperheroes);

        } else if (sortOption == "Publisher") {
            const sortedSuperheroes = sortSuperheroesByPublisher(globalSuperheroData);
            displaySearchResults(sortedSuperheroes);

        } else if (sortOption == "Power") {
            const sortedSuperheroes = sortSuperheroesByPower(globalSuperheroData);
            displaySearchResults(sortedSuperheroes);

        } else {
            alert("Please Select A Sort Option");
        }
    }

    function sortSuperheroesByName(superheroes) {
        return superheroes.sort((a, b) => a.name.localeCompare(b.name));
    }

    function sortSuperheroesByRace(superheroes) {
        return superheroes.sort((a, b) => a.Race.localeCompare(b.Race));
    }

    function sortSuperheroesByPublisher(superheroes) {
        return superheroes.sort((a, b) => a.Publisher.localeCompare(b.Publisher));
    }

    function sortSuperheroesByPower(heroes) {
        return heroes.sort((a, b) => {
            // Get the first power of each superhero
            // The Object.keys method returns an array of a given object's own enumerable property names.
            const firstPowerA = Object.keys(a.Powers)[0] || "";
            const firstPowerB = Object.keys(b.Powers)[0] || "";

            // Use localeCompare for a case-insensitive comparison of the first power
            return firstPowerA.localeCompare(firstPowerB);
        });
    }

    function displayOutput(data) {
        const displayBox = document.querySelector('.display-box');

        // Create an empty string to store the formatted HTML
        let formattedHtml = "";

        // Check if the data is an array or an object
        if (Array.isArray(data)) {
            // If it's an array, iterate through the elements and add them to the formattedHtml string
            for (let i = 0; i < data.length; i++) {
                formattedHtml += `${i + 1}: ${data[i]}<br>`; // Start numbering at 1
            }
        } else if (typeof data === 'object') {
            // If it's an object, iterate through the properties and add them to the formattedHtml string
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    formattedHtml += `${key}: ${data[key]}<br>`;
                }
            }
        }

        // Set the formatted HTML as the inner HTML content of the display box
        displayBox.innerHTML = formattedHtml;
    }

    function displayMatches(data) {
        const displayBox = document.querySelector('.display-box');
        const matchesConfirmation = document.getElementById('matches-confirmation'); // Make sure this is the correct ID for your element
        let formattedHtml = "";

        // Check for the presence of an "Error" key in the response
        if (data === 0) {
            formattedHtml = '';
            outputText = document.createTextNode('No Matches Found');
            matchesConfirmation.textContent = outputText.textContent;
        } else if (Array.isArray(data) && data.length > 0) {
            // If there are matches, format them
            data.forEach((superhero, index) => {
                formattedHtml += `<div style="text-align: center; font-weight: bold;">Superhero ${index + 1}</div>`;
                for (const key in superhero) {
                    if (Object.prototype.hasOwnProperty.call(superhero, key)) {
                        formattedHtml += `<span style="color: #F3EEEA;">${key}</span>: ${superhero[key]}<br>`;
                    }
                }
                formattedHtml += `<hr style="margin-top: 10px; margin-bottom: 10px;">`;
            });
            outputText = document.createTextNode('Matches Found');
            matchesConfirmation.textContent = outputText.textContent;
        } else {
            // If there are no matches and no error, clear the display and show a default message
            displayBox.innerHTML = 'No Results Available';
            outputText = document.createTextNode('No Matches Available');
            matchesConfirmation.textContent = outputText.textContent;
        }

        // Set the formatted HTML as the inner HTML content of the display box
        displayBox.innerHTML = formattedHtml;
    }

    function displaySearchResults(data) {
        const displayBox = document.querySelector('.display-box');
        let formattedOutput = '';

        // Check if data is an array and has elements
        if (Array.isArray(data) && data.length > 0) {
            // Iterate through each superhero object
            data.forEach((hero, index) => {
                // Add a centered and bold title for each superhero
                formattedOutput += `<div style="text-align: center; font-weight: bold;">Superhero ${index + 1}</div>`;
                // Iterate through each property of the superhero object
                for (const key in hero) {
                    if (hero.hasOwnProperty(key)) {
                        // Special formatting for 'Powers', similar to what was done in the original second snippet
                        if (key === 'Powers') {
                            formattedOutput += `<span style="color: #F3EEEA;">${key}</span>: `;
                            let powersList = [];
                            for (const power in hero[key]) {
                                if (hero[key][power] === 'True') {
                                    powersList.push(power);
                                }
                            }
                            // Join all powers using comma and space
                            formattedOutput += `${powersList.join(', ')}<br>`;
                        } else {
                            // Output other properties with red key names
                            formattedOutput += `<span style="color: #F3EEEA;">${key}</span>: ${hero[key]}<br>`;
                        }
                    }
                }
                // Add spacing between superheroes instead of a line
                formattedOutput += `<div style="margin-bottom: 20px;"></div>`; // Space for visual separation
            });
        } else {
            formattedOutput = "No Results Available";
        }

        // Set the formatted output string as the inner HTML of the display box
        displayBox.innerHTML = formattedOutput;
    }
});
