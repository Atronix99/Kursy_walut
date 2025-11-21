const settingsIcon = document.getElementById('settingsIcon');
const settingsMenu = document.getElementById('settingsMenu');
const favoritesButton = document.getElementById('favoritesButton');
const favoritesOverlay = document.getElementById('favoritesOverlay');
const favoritesContent = document.querySelector('.favorites-content');

const darkModeToggle = document.getElementById('darkModeToggle'); 
const body = document.body;
const siteLogo = document.getElementById('siteLogo');
const siteLogoSmall = document.getElementById('siteLogoSmall'); 
const siteFooter = document.querySelector('.site-footer');
const mainView = document.getElementById('mainView');
const countryDetailsView = document.getElementById('countryDetailsView');
const countryFlag = document.getElementById('countryFlag');
const countryName = document.getElementById('countryName');
const countryCapital = document.getElementById('countryCapital');
const countryRegion = document.getElementById('countryRegion');
const countryPopulation = document.getElementById('countryPopulation');
const countryCurrency = document.getElementById('countryCurrency');
const countryLanguage = document.getElementById('countryLanguage');
const countryTimezone = document.getElementById('countryTimezone');
const favoriteStar = document.getElementById('favoriteStar');
const conversionCurrencySelect = document.getElementById('conversionCurrencySelect');
const currencyCodeElement = document.getElementById('currencyCode');
const conversionCurrencyCodeElement = document.getElementById('conversionCurrencyCode');
const currencyAmountInput = document.getElementById('currencyAmount');
const convertedAmountSpan = document.getElementById('convertedAmount');
const chartButtons = document.querySelectorAll('.chart-btn');
const currencyChartCanvas = document.getElementById('currencyChart');
const chartMessageElement = document.getElementById('chartMessage');
const calculatorButton = document.getElementById('calculatorButton');
const chartControlsDiv = document.querySelector('.chart-controls');

let allCountries = [];
let availableCurrencies = {};
let currentCountryData = null;
let favorites = [];
let currencyChartInstance = null;

function setConversionDisplay(baseCurrency, targetCurrency, isSupported) {
    const currencyConverterDiv = currencyAmountInput.closest('.currency-converter');
    const amountInput = currencyAmountInput;
    const baseCode = currencyCodeElement;
    const targetCode = conversionCurrencyCodeElement;
    const resultSpan = convertedAmountSpan;
    const converterLabel = currencyConverterDiv.querySelector('label');
    const na = document.querySelector('#na');
    const isSameCurrency = baseCurrency === targetCurrency && isSupported;

    if (isSupported && !isSameCurrency) {
        amountInput.style.display = 'inline';
        baseCode.style.display = 'inline';
        targetCode.style.display = 'inline';
        resultSpan.style.display = 'inline';
        converterLabel.style.display = 'inline';
        na.style.display = 'inline';
        
        amountInput.disabled = false;
        amountInput.value = amountInput.value || '1';
        resultSpan.textContent = 'N/A';
        converterLabel.textContent = 'Przelicznik Walut:';
        baseCode.textContent = baseCurrency;
        targetCode.textContent = targetCurrency;
        
        currencyConverterDiv.classList.remove('error-state');
        
        chartControlsDiv.classList.remove('hidden-view');
        calculatorButton.classList.remove('hidden-view');
        
    } else if (isSameCurrency) {
        amountInput.style.display = 'none';
        baseCode.style.display = 'none';
        targetCode.style.display = 'none';
        na.style.display = 'none';
        
        converterLabel.textContent = 'Przelicznik Walut:';
        resultSpan.textContent = 'Ta sama waluta'; 
        resultSpan.style.display = 'inline';
        currencyConverterDiv.classList.add('error-state');
        
        chartControlsDiv.classList.add('hidden-view');
        calculatorButton.classList.add('hidden-view');
        
    } else {
        
        const message = baseCurrency === 'N/A' 
            ? 'Waluta nieznana.' 
            : `Waluta ${baseCurrency} nieobsługiwana przez API.`;
        
        converterLabel.textContent = 'Błąd Waluty:';
        amountInput.style.display = 'none';
        baseCode.style.display = 'none';
        targetCode.style.display = 'none';
        na.style.display = 'none';
        resultSpan.textContent = message; 
        resultSpan.style.display = 'inline';
        currencyConverterDiv.classList.add('error-state');
        chartControlsDiv.classList.add('hidden-view');
        calculatorButton.classList.add('hidden-view');
    }
}

function loadFavorites() {
    const storedFavorites = localStorage.getItem('favorites');
    favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function isFavorite(countryCommonName) {
    return favorites.includes(countryCommonName);
}

function toggleFavorite(country) {
    const countryCommonName = country.commonName; 
    const index = favorites.indexOf(countryCommonName);

    if (index > -1) {
        favorites.splice(index, 1);
        favoriteStar.classList.remove('fas');
        favoriteStar.classList.add('far');
    } else {
        favorites.push(countryCommonName);
        favoriteStar.classList.remove('far');
        favoriteStar.classList.add('fas');
    }
    saveFavorites();
}

function removeFavoriteFromList(commonName) {
    const index = favorites.indexOf(commonName);
    if (index > -1) {
        favorites.splice(index, 1);
        saveFavorites();
        renderFavoritesList(); 
        
        if (currentCountryData && currentCountryData.commonName === commonName) {
            favoriteStar.classList.remove('fas');
            favoriteStar.classList.add('far');
        }
    }
}

function renderFavoritesList() {
    const favoritesContent = document.querySelector('.favorites-content');
    
    let closeButtonHtml = '<button id="closeFavorites">Zamknij</button>';
    let listHtml = '<h2>Ulubione</h2>';
    
    if (favorites.length === 0) {
        listHtml += '<p>Nie masz jeszcze ulubionych krajów.</p>';
    } else {
        listHtml += '<ul class="favorites-list">';
        
        favorites.forEach(commonName => {
            const country = allCountries.find(c => c.commonName === commonName);
            if (country) {
                listHtml += `<li data-country-common-name="${commonName}">
                    <span class="favorite-name-flag">
                        ${country.name} 
                        <img src="${country.flags.svg}" alt="Flaga" style="height: 15px; margin-left: 10px; border: 1px solid #ccc;">
                    </span>
                    <i class="fas fa-trash-alt remove-favorite" data-common-name="${commonName}" style="cursor: pointer; color: #cc0000; margin-left: 10px;"></i>
                </li>`;
            }
        });
        
        listHtml += '</ul>';

        // Zakładam, że masz już zmienne:
const favoritesOverlay = document.getElementById('favoritesOverlay');



    }
    

    
    favoritesContent.innerHTML = listHtml + closeButtonHtml;
    
    document.getElementById('closeFavorites').addEventListener('click', () => {
        favoritesOverlay.classList.remove('visible');
    });

    favoritesContent.querySelectorAll('.favorites-list li').forEach(item => {
        const commonName = item.dataset.countryCommonName;
        
        const removeIcon = item.querySelector('.remove-favorite');
        removeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavoriteFromList(commonName);
        });

        item.querySelector('.favorite-name-flag').addEventListener('click', function() {
            const country = allCountries.find(c => c.commonName === commonName);
            if (country) {
                favoritesOverlay.classList.remove('visible');
                showCountryDetails(country);
            }
        });

        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-favorite')) {
                return;
            }
            const country = allCountries.find(c => c.commonName === commonName);
            if (country) {
                favoritesOverlay.classList.remove('visible');
                showCountryDetails(country);
            }
        });
    });
}
// Listener do kliknięcia poza content
favoritesOverlay.addEventListener('click', (e) => {
    if (!favoritesContent.contains(e.target)) {
        favoritesOverlay.classList.remove('visible');
    }
});

// Delegacja dla przycisków "usuń ulubione"
favoritesContent.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-favorite')) {
        const name = e.target.dataset.commonName;
        removeFromFavorites(name);
        renderFavoritesList(); // odśwież listę
    }

    if (e.target.id === 'closeFavorites') {
        favoritesOverlay.classList.remove('visible');
    }
});

function setDarkMode(isDark) {
    if (isDark) {
        body.classList.add('dark-mode');
        siteLogo.src = 'assets/ciemne_logo.png'; 
        siteLogoSmall.src = 'assets/ciemne_logo.png';
    } else {
        body.classList.remove('dark-mode');
        siteLogo.src = 'assets/jasne_logo.png';
        siteLogoSmall.src = 'assets/jasne_logo.png';
    }
    localStorage.setItem('darkMode', isDark);
    
    if (currencyChartInstance) {
        const activePeriod = document.querySelector('.chart-btn.active').dataset.period;
        fetchAndRenderChart(currentCountryData.currencyCode, conversionCurrencySelect.value, activePeriod);
    }
    if (typeof AOS !== 'undefined') {
        AOS.refreshHard(); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'; 
    if (isDarkMode) {
        darkModeToggle.checked = true;
    }
    setDarkMode(isDarkMode);
    
    const storedCurrency = localStorage.getItem('conversionCurrency') || 'PLN';
    conversionCurrencyCodeElement.textContent = storedCurrency; 

    loadFavorites();

    if (mainView && !mainView.classList.contains('hidden-view')) {
        siteFooter.classList.add('hidden-view');
    }

    if (typeof AOS !== 'undefined') { 
        AOS.init({
            once: true,
            duration: 800,
            disable: 'phone'
        });
    }
});

settingsIcon.addEventListener('click', () => {
    settingsIcon.classList.toggle('rotated');
    settingsMenu.classList.toggle('open');
});

favoritesButton.addEventListener('click', () => {
    renderFavoritesList();
    favoritesOverlay.classList.add('visible');
});

darkModeToggle.addEventListener('change', (event) => {
    setDarkMode(event.target.checked);
});

conversionCurrencySelect.addEventListener('change', (event) => {
    const newCurrency = event.target.value;
    localStorage.setItem('conversionCurrency', newCurrency);
    conversionCurrencyCodeElement.textContent = newCurrency;
    
    if (currentCountryData) {
        const baseCurrency = currentCountryData.currencyCode;
        
        const isSupported = baseCurrency !== 'N/A' && availableCurrencies.hasOwnProperty(baseCurrency);
        
        setConversionDisplay(baseCurrency, newCurrency, isSupported);
        
        if (isSupported) {
            if (baseCurrency !== newCurrency) {
                 updateCurrencyConversion(baseCurrency);
                 const activeBtn = document.querySelector('.chart-btn.active');
                 const activePeriod = activeBtn ? activeBtn.dataset.period : '7';
                 fetchAndRenderChart(baseCurrency, newCurrency, activePeriod);
            } else {
                showChartMessage(`Nie można wyświetlić wykresu dla takich samych walut. Zmień walutę w ustawieniach.`);
            }
        } else {
             showChartMessage(`Waluta ${baseCurrency} jest nieobsługiwana przez API Frankfurter. Wykres niedostępny.`);
        }
    }
});

async function fetchCountries() {
    try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,translations,flags,capital,region,population,currencies,languages,timezones");
        const data = await res.json();

        const regionPL = {
            "Europe": "Europa",
            "Asia": "Azja",
            "Africa": "Afryka",
            "Americas": "Ameryki",
            "Oceania": "Oceania",
            "Antarctic": "Antarktyka"
        };

        const currencyPL = {
            "USD": "dolar amerykański",
            "EUR": "euro",
            "PLN": "złoty",
            "GBP": "funt szterling",
            "JPY": "jen",
            "CNY": "juan",
            "RUB": "rubel",
            "INR": "rupia indyjska",
            "CHF": "frank szwajcarski",
            "CAD": "dolar kanadyjski",
            "AUD": "dolar australijski",
            "BRL": "real brazylijski",
            "ZAR": "rand południowoafrykański"
        };

        

        allCountries = data.map(c => {
            const countryNamePL = c.translations?.pol?.common || c.name.common;

            const currencyCode = c.currencies ? Object.keys(c.currencies)[0] : 'N/A';
            const currencyName = currencyPL[currencyCode] || (c.currencies && c.currencies[currencyCode] ? c.currencies[currencyCode].name : 'N/A');

            
            const capitalPL = c.capital && c.capital.length > 0 ? c.capital[0] : 'N/A';

            
            const languageNames = c.languages
    ? Object.values(c.languages)
        .map(lang => {
            const langLower = lang.toLowerCase();
            const translationMap = {
                "english": "angielski",
                "french": "francuski",
                "german": "niemiecki",
                "polish": "polski",
                "spanish": "hiszpański",
                "italian": "włoski",
                "portuguese": "portugalski",
                "russian": "rosyjski",
                "chinese": "chiński",
                "japanese": "japoński",
                "arabic": "arabski",
                "hindi": "hindi",
                "swahili": "suahili",
                "turkish": "turecki",
                "korean": "koreański"
                
            };
            return translationMap[langLower] || lang;
        })
        .join(', ')
    : 'N/A';

            if (currencyCode !== 'N/A') availableCurrencies[currencyCode] = currencyName;

            return {
                name: countryNamePL,
                commonName: c.name.common,
                flags: c.flags,
                capital: capitalPL,
                region: regionPL[c.region] || c.region || 'N/A',
                population: c.population ? c.population.toLocaleString('pl-PL') : 'N/A',
                currencyCode: currencyCode,
                currencyName: currencyName,
                languages: languageNames,
                timezones: c.timezones ? c.timezones.join(', ') : 'N/A',
            };
        }).sort((a, b) => a.name.localeCompare(b.name, "pl"));

        await fetchFrankfurterCurrencies();
        populateCurrencySelect(availableCurrencies);

    } catch (error) {
        console.error("Błąd fetch:", error);
        const input = document.querySelector(".search-input");
        input.placeholder = "Błąd pobierania krajów";
        const desc = document.querySelector('.description-text');
        desc.innerHTML = "Błąd pobierania krajów.<br>Spróbuj później!";
        desc.style.color = 'red';
        desc.style.textDecoration = 'underline';
    }
}

async function fetchFrankfurterCurrencies() {
    try {
        const response = await fetch('https://api.frankfurter.app/latest');
        const data = await response.json();
        const frankfurterCurrencies = Object.keys(data.rates);
        
        if (!availableCurrencies[data.base]) {
             availableCurrencies[data.base] = data.base; 
        }
        
        const filteredCurrencies = {};
        Object.keys(availableCurrencies).forEach(code => {
            if (frankfurterCurrencies.includes(code) || code === data.base) {
                filteredCurrencies[code] = availableCurrencies[code];
            }
        });
        availableCurrencies = filteredCurrencies;
        
    } catch (error) {
        console.error("Błąd pobierania walut z Frankfurter:", error);
    }
}


function populateCurrencySelect(currencies) {
    const codes = Object.keys(currencies).sort();
    conversionCurrencySelect.innerHTML = '';
    
    codes.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code} - ${currencies[code] || code}`;
        conversionCurrencySelect.appendChild(option);
    });
    
    const storedCurrency = localStorage.getItem('conversionCurrency') || 'PLN';
    if (conversionCurrencySelect.querySelector(`option[value="${storedCurrency}"]`)) {
        conversionCurrencySelect.value = storedCurrency;
    } else if (codes.includes('PLN')) {
        conversionCurrencySelect.value = 'PLN'; 
    } else if (codes.length > 0) {
        conversionCurrencySelect.value = codes[0]; 
    }
    
    conversionCurrencyCodeElement.textContent = conversionCurrencySelect.value;
}

function setupSearchInput(inputElement, suggestionsElement) {
    inputElement.addEventListener("input", () => {
        const value = inputElement.value.trim().toLowerCase();
        suggestionsElement.innerHTML = "";
        
        if (!value) {
            suggestionsElement.style.display = "none";
            return;
        }
        const mainContainer=document.querySelector(".main-section")
        const filtered = allCountries
            .filter(c => c.name.toLowerCase().startsWith(value))
            .slice(0, 10);

        filtered.forEach(country => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.textContent = country.name;
            div.addEventListener("click", () => {
                inputElement.value = country.name;
                suggestionsElement.innerHTML = "";
                suggestionsElement.style.display = "none";
                mainContainer.style.display="none"
                showCountryDetails(country); 
                
            });
            suggestionsElement.appendChild(div);
        });
        
        suggestionsElement.style.display = filtered.length ? "block" : "none";
        if(inputElement.classList.contains('details-search-input')) {
            const searchBoxRect = inputElement.closest('.search-box').getBoundingClientRect();
            suggestionsElement.style.top = `${searchBoxRect.height - 1}px`;
            suggestionsElement.style.left = '0';
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const mainInput = document.querySelector(".search-input");
    const mainSuggestions = document.getElementById("suggestions");
    const detailsInput = document.querySelector(".details-search-input");
    const detailsSuggestions = document.getElementById("detailsSuggestions");
    
    setupSearchInput(mainInput, mainSuggestions);
    setupSearchInput(detailsInput, detailsSuggestions);
    
    document.addEventListener("click", e => {
        if (!mainInput.contains(e.target) && !mainSuggestions.contains(e.target)) {
            mainSuggestions.style.display = "none";
        }
        if (!detailsInput.contains(e.target) && !detailsSuggestions.contains(e.target)) {
            detailsSuggestions.style.display = "none";
        }
    });

    fetchCountries();
});

function showMainView() {
    mainView.classList.remove('hidden-view');
    countryDetailsView.classList.add('hidden-view');
    siteFooter.classList.add('hidden-view');
    currentCountryData = null;
    if (currencyChartInstance) {
        currencyChartInstance.destroy();
        currencyChartInstance = null;
    }
}

function showCountryDetails(country) {
    currentCountryData = country;
    
    countryFlag.src = country.flags.svg;
    countryFlag.alt = `Flaga ${country.name}`;
    countryName.textContent = country.name;
    countryCapital.textContent = country.capital;
    countryRegion.textContent = country.region;
    countryPopulation.textContent = country.population;
    countryCurrency.textContent = `${country.currencyName} (${country.currencyCode})`;
    countryLanguage.textContent = country.languages;
    countryTimezone.textContent = country.timezones;
    
    currencyCodeElement.textContent = country.currencyCode;
    
    const targetCurrency = conversionCurrencySelect.value;
    const baseCurrency = country.currencyCode;
    
    const isSupported = baseCurrency !== 'N/A' && availableCurrencies.hasOwnProperty(baseCurrency);
    
    setConversionDisplay(baseCurrency, targetCurrency, isSupported); 
    
    document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
    const defaultBtn = document.querySelector('.chart-btn[data-period="7"]');
    
    if (defaultBtn) defaultBtn.classList.add('active');
    
    if (isSupported && baseCurrency !== targetCurrency) {
        updateCurrencyConversion(baseCurrency);
        fetchAndRenderChart(baseCurrency, targetCurrency, defaultBtn.dataset.period);
    } else if (baseCurrency === targetCurrency) {
        showChartMessage(`Nie można wyświetlić wykresu dla takich samych walut. Zmień walutę w ustawieniach.`);
    } else {
         showChartMessage(`Waluta ${baseCurrency} jest nieobsługiwana przez API Frankfurter. Wykres niedostępny.`);
    }
    
    favoriteStar.classList.remove('fas', 'far');
    if (isFavorite(country.commonName)) {
        favoriteStar.classList.add('fas');
    } else {
        favoriteStar.classList.add('far');
    }
    
    mainView.classList.add('hidden-view')
    countryDetailsView.classList.remove('hidden-view');
    siteFooter.classList.remove('hidden-view');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (typeof AOS !== 'undefined') { 
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                AOS.refreshHard(); 
            });
        });
    }
}

async function fetchLatestRate(baseCurrency, targetCurrency) {
    if (baseCurrency === 'N/A') {
        return { rate: null, error: "Waluta kraju jest nieznana." };
    }
    if (!availableCurrencies[baseCurrency] || !availableCurrencies[targetCurrency]) {
        return { rate: null, error: `Waluta ${baseCurrency} jest nieobsługiwana przez API.` };
    }


    try {
        const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetCurrency}`);
        const data = await response.json();

        if (data.rates && data.rates[targetCurrency]) {
            return { rate: data.rates[targetCurrency], error: null };
        } else {
            return { rate: null, error: `Brak aktualnego kursu dla ${baseCurrency} na ${targetCurrency}.` };
        }
    } catch (error) {
        console.error("Błąd pobierania kursu:", error);
        return { rate: null, error: "Błąd połączenia z API kursów walut." };
    }
}

async function updateCurrencyConversion(baseCurrency) {
    const amount = parseFloat(currencyAmountInput.value) || 1;
    const targetCurrency = conversionCurrencySelect.value;

    const convertedAmountElement = convertedAmountSpan;

    const result = await fetchLatestRate(baseCurrency, targetCurrency);

    if (result.error) {
        convertedAmountElement.textContent = "N/A";
        return;
    }

    
    const adjust = adjustSmallCurrencyAmount(amount, result.rate);

    if (adjust.newAmount !== amount) {
        currencyAmountInput.value = adjust.newAmount;
    }

    const adjustedAmount = adjust.newAmount;
    const rate = result.rate;

    
    const finalValue = adjustedAmount * rate;
    convertedAmountElement.textContent = formatConvertedValue(finalValue);
}

currencyAmountInput.addEventListener('input', () => {
    if (currentCountryData) {
        updateCurrencyConversion(currentCountryData.currencyCode);
    }
});

function getDates(daysAgo) {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysAgo);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    return {
        startDate: formatDate(startDate),
        endDate: formatDate(today)
    };
}

async function fetchHistoricalRates(baseCurrency, targetCurrency, days) {
    const dates = getDates(days);
    
    const url = `https://api.frankfurter.app/${dates.startDate}..${dates.endDate}?from=${baseCurrency}&to=${targetCurrency}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.rates && Object.keys(data.rates).length > 0) {
            return data.rates;
        } else {
            return null; 
        }
    } catch (error) {
        console.error("Błąd pobierania danych historycznych:", error);
        return null;
    }
}

async function fetchAndRenderChart(baseCurrency, targetCurrency, period) {
    chartMessageElement.classList.add('hidden-view');
    currencyChartCanvas.classList.remove('hidden-view');
    
    if (currencyChartInstance) {
        currencyChartInstance.destroy();
        currencyChartInstance = null;
    }
    
    if (baseCurrency === targetCurrency) {
        showChartMessage(`Nie można wyświetlić wykresu dla takich samych walut. Zmień walutę w ustawieniach.`);
        return;
    }
    
    if (baseCurrency === 'N/A' || !availableCurrencies.hasOwnProperty(baseCurrency)) {
        setConversionDisplay(baseCurrency, targetCurrency, false); 
        showChartMessage(`Waluta ${baseCurrency} jest nieobsługiwana przez API Frankfurter. Wykres niedostępny.`);
        return;
    }

    const rates = await fetchHistoricalRates(baseCurrency, targetCurrency, period);

    if (!rates || Object.keys(rates).length === 0) {
        showChartMessage(`Nie udało się pobrać danych historycznych dla ${baseCurrency} na ${targetCurrency} w okresie ${period} dni.`);
        return;
    }
    
    const labels = Object.keys(rates).sort();
    const dataPoints = labels.map(date => rates[date][targetCurrency]);
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    const chartColor = isDarkMode ? getComputedStyle(document.documentElement).getPropertyValue('--button-color') : getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    const chartColorRgba = chartColor.trim() === '#005EFF' ? 'rgba(0, 94, 255, 0.1)' : 'rgba(94, 189, 158, 0.2)';

    currencyChartInstance = new Chart(currencyChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Kurs 1 ${baseCurrency} na ${targetCurrency}`,
                data: dataPoints,
                borderColor: chartColor,
                backgroundColor: chartColorRgba,
                tension: 0.2,
                fill: true,
                pointRadius: 0, 
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Data'
                    },
                    ticks: {
                         autoSkip: true,
                         maxTicksLimit: 10,
                         color: isDarkMode ? 'white' : 'black'
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: `Wartość w ${targetCurrency}`
                    },
                    ticks: {
                         color: isDarkMode ? 'white' : 'black'
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: isDarkMode ? 'white' : 'black'
                    }
                }
            }
        }
    });
}



function showChartMessage(message) {
    if (currencyChartInstance) {
        currencyChartInstance.destroy();
        currencyChartInstance = null;
    }
    currencyChartCanvas.classList.add('hidden-view');
    chartMessageElement.classList.remove('hidden-view');
    chartMessageElement.textContent = message;
}

chartButtons.forEach(button => {
    button.addEventListener('click', function() {
        chartButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        if (currentCountryData) {
            const baseCurrency = currentCountryData.currencyCode;
            const targetCurrency = conversionCurrencySelect.value;
            const period = this.dataset.period;
            
            if (baseCurrency !== targetCurrency) {
                fetchAndRenderChart(baseCurrency, targetCurrency, period);
            } else {
                 showChartMessage(`Nie można wyświetlić wykresu dla takich samych walut. Zmień walutę w ustawieniach.`);
            }
        }
    });
});
function formatConvertedValue(value) {
    let digits = 2;

    if (value < 1) digits = 4;
    if (value < 0.01) digits = 6;
    if (value < 0.0001) digits = 8;

    return parseFloat(value.toFixed(digits)).toString();
}
function adjustSmallCurrencyAmount(amount, rate) {
    const converted = amount * rate;

    if (converted < 0.001) {
        return { newAmount: 10000, multiply: 10000 };
    }
    if (converted < 0.01) {
        return { newAmount: 1000, multiply: 1000 };
    }

    return { newAmount: amount, multiply: 1 };
}

favoriteStar.addEventListener('click', () => {
    if (currentCountryData) {
        toggleFavorite(currentCountryData);
    }
});



/* ==========================
   OBSŁUGA LUPY I ENTERA
   ========================== */

const mainSearchInput = document.querySelector(".search-input");
const mainSearchButton = document.getElementById("searchIcon");

if (mainSearchButton) {
    mainSearchButton.addEventListener("click", () => {
        triggerSearch(mainSearchInput.value.trim(), false);
    });
}

const detailsSearchInput = document.querySelector(".details-search-input");
const detailsSearchButton = document.getElementById("detailsSearchIcon");

if (detailsSearchButton) {
    detailsSearchButton.addEventListener("click", () => {
        triggerSearch(detailsSearchInput.value.trim(), true);
    });
}

// Enter w obu inputach
mainSearchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") triggerSearch(mainSearchInput.value.trim(), false);
});
detailsSearchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") triggerSearch(detailsSearchInput.value.trim(), true);
});

// Wspólna funkcja
function triggerSearch(query, inDetailsView) {
    if (!query) return;

    const match = allCountries.find(c =>
        c.name.toLowerCase().startsWith(query.toLowerCase())
    );

    if (!match) {
        const suggestionsEl = inDetailsView ? document.getElementById("detailsSuggestions") : document.getElementById("suggestions");
        suggestionsEl.innerHTML = "";
        suggestionsEl.style.display = "none";
        return;
    }

    if (inDetailsView) {
        document.getElementById("detailsSuggestions").innerHTML = "";
        document.getElementById("detailsSuggestions").style.display = "none";
    } else {
        document.getElementById("suggestions").innerHTML = "";
        document.getElementById("suggestions").style.display = "none";
        document.querySelector(".main-section").style.display = "none";
    }

    showCountryDetails(match);
}



