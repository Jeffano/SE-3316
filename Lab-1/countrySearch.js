document.addEventListener('DOMContentLoaded', function () {
    const countryName = document.getElementById('country-input')
    const currencyTxt = document.getElementById('currency-input')
    
    const btnCountry = document.getElementById('search-country')
    const btnCurrency = document.getElementById('search-currency')


    //Array of Countries    
    const countryList = [
        ["Belize", "BZD"],
        ["Guatemala", "GTQ"],
        ["Mongolia", "MNT"],
        ["Jordan", "JOD"],
        ["Luxembourg", "EUR"],
        ["Benin", "XOF"],
        ["Finland", "EUR"],
        ["Burundi", "BIF"],
        ["Afghanistan", "AFN"],
        ["Papua New Guinea", "PGK"],
        ["Qatar", "QAR"],
        ["Chad", "XOF"],
        ["El Salvador", "SVC"],
        ["Seychelles", "SCR"],
        ["Italy", "EUR"],
        ["Cameroon", "XOF"],
        ["Ghana", "GHS"],
        ["Nicaragua", "NIO"],
        ["Zimbabwe", "ZWD"],
        ["Saudi Arabia", "SAR"]
    ];

    //Checking for the user input for countries
    countryName.addEventListener('input', function(){
        const inputCountry = countryName.value;
        var nonCharacters = /[^A-Za-z]/;

        if (nonCharacters.test(inputCountry)) {
            alert('Please Enter A Valid Country');
            
        }

        const filteredCountry = inputCountry.replace(/[^A-Za-z]/g, '');;
        countryName.value = filteredCountry;

        if (filteredValue.length > 20) {
            countryName.value = filteredValue.slice(0, 20);
        }
    })

    currencyTxt.addEventListener('input', function(){
        const inputCurrency = currencyTxt.value;
        const filteredCurrency = inputCurrency.replace(/[^A-Z]/g, '').substring(0, 3);
        currencyTxt.value = filteredCurrency;

        if (filteredValue.length > 20) {
            currencyTxt.value = filteredValue.slice(0, 20);
        }
    })


    btnCountry.addEventListener('click',searchCountries);
    btnCurrency.addEventListener('click',searchCurrencies);

    countryName.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchCountries();
        }
    });

    currencyTxt.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchCurrencies();
        }
    });
    

    function searchCountries(){
        var inputCountry = countryName.value;

        if (inputCountry === null || inputCountry === ""){
            alert("Enter A Country")
        }
        else{
            let output = "";
            let count = 0;
    
            for (let i = 0; i < countryList.length; i++){
                const pair = countryList[i];
            
                if (pair[0].toLowerCase().includes(inputCountry.toLowerCase())) {
                    count++
                    if (count<6){
                        output += "Country: " + pair[0] + " - Currency: " + pair[1] + "\n"
                    }
                }
            }
    
            if (output === ""){
                alert("Country Not Found")
            }else{
                alert(output)
            }
        }

    }

    function searchCurrencies(){
        var inputCurrency = currencyTxt.value;

        if (inputCurrency === null || inputCurrency === ""){
            alert("Enter A Currency")
        }
        else if(inputCurrency.length < 3){
            alert("Enter A Currency")
        }
        else{
            let output = "";
            let count = 0;
    
            for (let i = 0; i < countryList.length; i++){
                const pair = countryList[i];
            
                if (inputCurrency === pair[1]) {
                    count++
                    if (count<6){
                        output += "Currency: " + pair[1] + " - Country: " + pair[0] + "\n"
                    }
                }
            }
    
            if (output === ""){
                alert("Currency Not Found")
            }else{
                alert(output)
            }
        }
    }
});



