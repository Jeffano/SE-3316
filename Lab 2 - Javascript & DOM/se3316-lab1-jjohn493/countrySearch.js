document.addEventListener('DOMContentLoaded', function () {
    const countryName = document.getElementById('country-input')
    const currencyTxt = document.getElementById('currency-input')

    // Get all country cards using querySelectorAll
    const countryCards = document.querySelectorAll('.country-card');

    // Initialize an empty array to store country data
    const countryDataArray = [];

    // Loop through each country card
    countryCards.forEach(function (countryCard) {
        // Access individual elements within each card
        const flagImage = countryCard.querySelector('.flag-image').src;
        const cardTitleLink = countryCard.querySelector('.card-title a').getAttribute('href');
        const currency = countryCard.querySelector('.currency').textContent.trim();
        const regionList = Array.from(countryCard.querySelectorAll('.region-list li')).map(region => region.textContent.trim());

        // Create an object for the country and store its data
        const countryData = {
            id: countryCard.id,
            flag: flagImage,
            link: cardTitleLink,
            currency: currency,
            regions: regionList
        };

        // Push the country data object into the array
        countryDataArray.push(countryData);
    });

    //Checking for the user input for countries
    countryName.addEventListener('input', function () {
        const inputCountry = countryName.value.trim();

        const filteredValue = inputCountry.replace(/[^A-Za-z]/g, '');;
        countryName.value = filteredValue;

        if (filteredValue.length > 20) {
            countryName.value = filteredValue.slice(0, 20);
        }
    })

    // Add an event listener to the country input field for keyup events
    countryName.addEventListener('keyup', function () {

        const errorMessage = document.getElementById('error-message');
        const userInput = countryName.value.toLowerCase();

        if (userInput.match(/[^a-z]/) || userInput.trim() === '') {
            clearSearchResults();
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Please Enter Alphabetic Characters For Countries.';
            return;
        }

        // Filter the country data based on the user's input
        const filteredCountries = countryDataArray.filter(function (country) {
            return country.id.toLowerCase().includes(userInput);
        });

        // Update the search results with the filtered countries
        displayFilteredCountries(filteredCountries);
    });

    //Checking for the user input for currencies
    currencyTxt.addEventListener('input', function () {
        const inputCurrency = currencyTxt.value.trim();
        const filteredCurrency = inputCurrency.replace(/[^A-Z]/g, '').substring(0, 3);

        currencyTxt.value = filteredCurrency;

        if (filteredValue.length > 3) {
            currencyTxt.value = filteredValue.slice(0, 3);
        }
    })

    // Function to display filtered countries in the HTML
    function displayFilteredCountries(filteredCountries) {
        const searchResults = document.getElementById('search-results');
        clearErrorMessage()
        clearSearchResults()

        if (filteredCountries.length === 0) {
            // Clear the CSS filters when there are no filtered countries
            searchResults.textContent = 'No Matching Countries Found.';

        } else {
            filteredCountries.forEach(function (country) {
                const countryCard = document.createElement('div');
                countryCard.classList.add('country-card');

                const flagImage = document.createElement('img');
                flagImage.classList.add('flag-image');
                flagImage.src = country.flag;
                flagImage.alt = country.id + ' Flag';

                const cardTitle = document.createElement('p');
                cardTitle.classList.add('card-title');
                const cardLink = document.createElement('a');
                cardLink.href = country.link;
                cardLink.textContent = country.id;
                cardTitle.appendChild(cardLink);

                const currencyInfo = document.createElement('p');
                currencyInfo.classList.add('currency');
                currencyInfo.textContent = country.currency;

                const regionsCard = document.createElement('div');
                regionsCard.classList.add('regions-card');

                const regionTitle = document.createElement('p');
                regionTitle.classList.add('region-title');
                regionTitle.textContent = 'List of Regions';

                const regionList = document.createElement('ul');
                regionList.classList.add('region-list');

                country.regions.forEach(function (region) {
                    const regionItem = document.createElement('li');
                    regionItem.textContent = region;
                    regionList.appendChild(regionItem);
                });

                regionsCard.appendChild(regionTitle);
                regionsCard.appendChild(regionList);

                countryCard.appendChild(flagImage);
                countryCard.appendChild(cardTitle);
                countryCard.appendChild(currencyInfo);
                countryCard.appendChild(regionsCard);

                searchResults.appendChild(countryCard);
            });
        }
    }

    // Add an event listener for focus on the input field
    countryName.addEventListener('focus', function () {
        const errorMessage = document.getElementById('error-message'); 
        // Clear the error message and hide it
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    });

    

    // Add an event listener for focus on the input field
    currencyTxt.addEventListener('focus', function () {
        const errorMessage = document.getElementById('error-message'); 
        // Clear the error message and hide it
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    });

    //Add an event listener to the currency input field for keyup events
    currencyTxt.addEventListener('input', function () {
        const inputCurrency = currencyTxt.value;
        const filteredCurrencyCode = inputCurrency.replace(/[^A-Z]/g, '').substring(0, 3);
        currencyTxt.value = filteredCurrencyCode;


        if (inputCurrency.match(/[a-z]/) || inputCurrency.trim() === "") {
            clearSearchResults();

            // Show the error message for lowercase or empty input
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Please Enter 3 Capital Letters without Lowercase Characters or Non-Alphabet Characters.';

        } else {
            const filteredCurrencies = countryDataArray.filter(country => {
                const currencyParts = country.currency.split("(");
                if (currencyParts.length > 1) {
                    return currencyParts[1].trim().toLowerCase().includes(filteredCurrencyCode.toLowerCase());
                }
                return country.currency.trim().toLowerCase().includes(filteredCurrencyCode.toLowerCase());
            });

            displayFilteredCountries(filteredCurrencies);

            // Hide the error message if it was previously displayed
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.display = 'none';
        }
    })

    // Function to clear search results
    function clearSearchResults() {
        const searchResults = document.getElementById('search-results');

        while (searchResults.firstChild) {
            searchResults.removeChild(searchResults.firstChild);
        }
    }

    function clearErrorMessage() {
        const errorMessage = document.getElementById('error-message');

        while (errorMessage.firstChild) {
            errorMessage.removeChild(errorMessage.firstChild);
        }
    }
});
