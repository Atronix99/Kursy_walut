// --- Elementy DOM ---
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

// --- Zmienne Globalne ---
let allCountries = []; // Wszystkie kraje pobrane z API
let availableCurrencies = {}; // Waluty dostępne w Frankfurter API
let currentCountryData = null; // Dane aktualnie wyświetlanego kraju
let favorites = []; // Lista ulubionych krajów
let currencyChartInstance = null; // Instancja Chart.js

/**
 * Ustawia wyświetlanie konwertera walut w zależności od tego, czy waluta bazowa jest wspierana.
 * @param {string} baseCurrency Kod waluty bazowej (kraju).
 * @param {string} targetCurrency Kod waluty docelowej (wybranej w ustawieniach).
 * @param {boolean} isSupported Czy waluta bazowa jest wspierana przez API kursów.
 */
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
        // Prawidłowe wyświetlanie konwertera
        amountInput.style.display = 'inline';
        baseCode.style.display = 'inline';
        targetCode.style.display = 'inline';
        resultSpan.style.display = 'inline';
        converterLabel.style.display = 'inline';
        na.style.display = 'inline';
        
        amountInput.textContent = '1'; 
        resultSpan.textContent = 'N/A';
        converterLabel.textContent = 'Currency Converter:';
        baseCode.textContent = baseCurrency;
        targetCode.textContent = targetCurrency;
        
        currencyConverterDiv.classList.remove('error-state');
        
        chartControlsDiv.classList.remove('hidden-view');
        calculatorButton.classList.remove('hidden-view');
        
    } else if (isSameCurrency) {
        // Waluta bazowa jest taka sama jak docelowa
        amountInput.style.display = 'none';
        baseCode.style.display = 'none';
        targetCode.style.display = 'none';
        na.style.display = 'none';
        
        converterLabel.textContent = 'Currency Converter:';
        resultSpan.textContent = 'Same Currency';
        resultSpan.style.display = 'inline';
        currencyConverterDiv.classList.add('error-state');
        
        chartControlsDiv.classList.add('hidden-view');
        calculatorButton.classList.add('hidden-view');
        
    } else {
        // Waluta bazowa nie jest wspierana (lub jest "N/A")
        const message = baseCurrency === 'N/A' 
            ? 'Currency Unknown.' 
            : `Currency ${baseCurrency} not supported by API.`;
        
        converterLabel.textContent = 'Currency Error:';
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

// --- Funkcje Ulubionych ---

/** Ładuje listę ulubionych krajów z Local Storage. */
function loadFavorites() {
    const storedFavorites = localStorage.getItem('favorites');
    favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
}

/** Zapisuje listę ulubionych krajów do Local Storage. */
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

/** Sprawdza, czy kraj jest ulubiony. */
function isFavorite(countryCommonName) {
    return favorites.includes(countryCommonName);
}

/** Dodaje/usuwa kraj z ulubionych i aktualizuje gwiazdkę. */
function toggleFavorite(country) {
    const countryCommonName = country.commonName; 
    const index = favorites.indexOf(countryCommonName);

    if (index > -1) {
        // Usuń
        favorites.splice(index, 1);
        favoriteStar.classList.remove('fas');
        favoriteStar.classList.add('far');
    } else {
        // Dodaj
        favorites.push(countryCommonName);
        favoriteStar.classList.remove('far');
        favoriteStar.classList.add('fas');
    }
    saveFavorites();
}

/** Usuwa kraj z listy ulubionych z poziomu nakładki. */
function removeFavoriteFromList(commonName) {
    const index = favorites.indexOf(commonName);
    if (index > -1) {
        favorites.splice(index, 1);
        saveFavorites();
        renderFavoritesList(); // Ponowne renderowanie listy
        
        // Jeśli aktualnie wyświetlany kraj jest usuwany z ulubionych, aktualizujemy ikonę
        if (currentCountryData && currentCountryData.commonName === commonName) {
            favoriteStar.classList.remove('fas');
            favoriteStar.classList.add('far');
        }
    }
}

/** Generuje i wyświetla listę ulubionych krajów w nakładce. */
function renderFavoritesList() {
    const favoritesContent = document.querySelector('.favorites-content');
    
    let closeButtonHtml = '<button id="closeFavorites">Close</button>';
    let listHtml = '<h2>Favorites</h2>';
    
    if (favorites.length === 0) {
        listHtml += '<p>You do not have any favorite countries yet.</p>';
    } else {
        listHtml += '<ul class="favorites-list">';
        
        favorites.forEach(commonName => {
            const country = allCountries.find(c => c.commonName === commonName);
            if (country) {
                // Generowanie elementów listy
                listHtml += `<li data-country-common-name="${commonName}">
                    <span class="favorite-name-flag">
                        ${country.name} 
                        <img src="${country.flags.svg}" alt="Flag" style="height: 15px; margin-left: 10px; border: 1px solid #ccc;">
                    </span>
                    <i class="fas fa-trash-alt remove-favorite" data-common-name="${commonName}" style="cursor: pointer; color: #cc0000; margin-left: 10px;"></i>
                </li>`;
            }
        });
        
        listHtml += '</ul>';
    }
    

    
    favoritesContent.innerHTML = listHtml + closeButtonHtml;
    
    // Ustawienie nasłuchiwania na przycisk zamknięcia
    document.getElementById('closeFavorites').addEventListener('click', () => {
        favoritesOverlay.classList.remove('visible');
    });

    // Ustawienie nasłuchiwania na kliknięcie elementu listy (przejście do detali)
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
// Nasłuchiwanie na kliknięcie poza zawartością nakładki (zamknięcie)
favoritesOverlay.addEventListener('click', (e) => {
    if (!favoritesContent.contains(e.target)) {
        favoritesOverlay.classList.remove('visible');
    }
});

// Delegowanie dla przycisków "usuń ulubione"
favoritesContent.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-favorite')) {
        const name = e.target.dataset.commonName;
        removeFavoriteFromList(name); 
    }

    if (e.target.id === 'closeFavorites') {
        favoritesOverlay.classList.remove('visible');
    }
});

// --- Tryb Ciemny/Jasny ---

/** Ustawia tryb ciemny lub jasny. */
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
    
    // Odświeżenie wykresu, aby dostosować kolory
    if (currencyChartInstance) {
        const activePeriod = document.querySelector('.chart-btn.active').dataset.period;
        fetchAndRenderChart(currentCountryData.currencyCode, conversionCurrencySelect.value, activePeriod);
    }
    // Odświeżenie animacji AOS
    if (typeof AOS !== 'undefined') {
        AOS.refreshHard(); 
    }
}

// --- Inicjalizacja Po Załadowaniu DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Wczytanie preferencji trybu ciemnego
    const isDarkMode = localStorage.getItem('darkMode') === 'true'; 
    if (isDarkMode) {
        darkModeToggle.checked = true;
    }
    setDarkMode(isDarkMode);
    
    // Wczytanie i ustawienie domyślnej waluty bazowej
    const storedCurrency = localStorage.getItem('conversionCurrency') || 'PLN';
    conversionCurrencyCodeElement.textContent = storedCurrency; 

    loadFavorites();

    // Ukrycie stopki w widoku głównym
    if (mainView && !mainView.classList.contains('hidden-view')) {
        siteFooter.classList.add('hidden-view');
    }

    // Inicjalizacja AOS (jeśli dostępny)
    if (typeof AOS !== 'undefined') { 
        AOS.init({
            once: true,
            duration: 800,
            disable: 'phone'
        });
    }
});

// --- Listenery Ustawień ---

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
                showChartMessage(`Cannot display chart for the same currency. Change the currency in settings.`);
            }
        } else {
             showChartMessage(`Currency ${baseCurrency} is not supported by the Frankfurter API. Chart unavailable.`);
        }
    }
});

// --- Pobieranie Danych o Krajach ---

/** Pobiera dane o wszystkich krajach i inicjalizuje listę walut. */
async function fetchCountries() {
    try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,translations,flags,capital,region,population,currencies,languages,timezones");
        const data = await res.json();

        const regionMap = {
            "Europe": "Europe",
            "Asia": "Asia",
            "Africa": "Africa",
            "Americas": "Americas",
            "Oceania": "Oceania",
            "Antarctic": "Antarctica"
        };
        
        const currencyMap = {}; // Pozostawione dla struktury

        allCountries = data.map(c => {
            // Używamy nazwy popularnej (common name) jako głównej nazwy
            const countryNameDisplay = c.name.common; 

            const currencyCode = c.currencies ? Object.keys(c.currencies)[0] : 'N/A';
            const currencyName = c.currencies && c.currencies[currencyCode] ? c.currencies[currencyCode].name : 'N/A';
            
            const capitalDisplay = c.capital && c.capital.length > 0 ? c.capital[0] : 'N/A';

            
            // Połączenie nazw języków
            const languageNames = c.languages
                ? Object.values(c.languages).join(', ')
                : 'N/A';

            if (currencyCode !== 'N/A') availableCurrencies[currencyCode] = currencyName;

            return {
                name: countryNameDisplay,
                commonName: c.name.common,
                flags: c.flags,
                capital: capitalDisplay,
                region: regionMap[c.region] || c.region || 'N/A',
                population: c.population ? c.population.toLocaleString('en-US') : 'N/A',
                currencyCode: currencyCode,
                currencyName: currencyName,
                languages: languageNames,
                timezones: c.timezones ? c.timezones.join(', ') : 'N/A',
            };
        }).sort((a, b) => a.name.localeCompare(b.name, "en"));

        await fetchFrankfurterCurrencies(); // Pobranie listy walut wspieranych przez API kursów
        populateCurrencySelect(availableCurrencies);

    } catch (error) {
        console.error("Błąd pobierania danych o krajach:", error);
        const input = document.querySelector(".search-input");
        input.placeholder = "Error fetching countries";
        const desc = document.querySelector('.description-text');
        desc.innerHTML = "Error fetching countries.<br>Please try again later!";
        desc.style.color = 'red';
        desc.style.textDecoration = 'underline';
    }
}

/** Pobiera listę wspieranych walut z Frankfurter API. */
async function fetchFrankfurterCurrencies() {
    try {
        const response = await fetch('https://api.frankfurter.app/latest');
        const data = await response.json();
        const frankfurterCurrencies = Object.keys(data.rates);
        
        // Dodanie waluty bazowej API (zazwyczaj EUR) do listy
        if (!availableCurrencies[data.base]) {
             availableCurrencies[data.base] = data.base; 
        }
        
        // Filtrowanie walut kraju do tych wspieranych przez Frankfurter API
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


/** Wypełnia pole wyboru waluty docelowej w ustawieniach. */
function populateCurrencySelect(currencies) {
    const codes = Object.keys(currencies).sort();
    conversionCurrencySelect.innerHTML = '';
    
    codes.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code} - ${currencies[code] || code}`;
        conversionCurrencySelect.appendChild(option);
    });
    
    // Ustawienie domyślnej lub zapisanej waluty
    const storedCurrency = localStorage.getItem('conversionCurrency') || 'USD'; 
    if (conversionCurrencySelect.querySelector(`option[value="${storedCurrency}"]`)) {
        conversionCurrencySelect.value = storedCurrency;
    } else if (codes.includes('USD')) {
        conversionCurrencySelect.value = 'USD'; 
    } else if (codes.length > 0) {
        conversionCurrencySelect.value = codes[0]; 
    }
    
    conversionCurrencyCodeElement.textContent = conversionCurrencySelect.value;
}

// --- Funkcje Wyszukiwania i Sugestii ---

/** Konfiguruje zachowanie inputu wyszukiwania i wyświetlania sugestii. */
function setupSearchInput(inputElement, suggestionsElement) {
    inputElement.addEventListener("input", () => {
        const value = inputElement.value.trim().toLowerCase();
        suggestionsElement.innerHTML = "";
        
        if (!value) {
            suggestionsElement.style.display = "none";
            return;
        }
        const mainContainer=document.querySelector(".main-section")
        
        // Filtrowanie krajów rozpoczynających się na wpisaną frazę
        const filtered = allCountries
            .filter(c => c.name.toLowerCase().startsWith(value))
            .slice(0, 10);

        filtered.forEach(country => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.textContent = country.name;
            div.addEventListener("click", () => {
                inputElement.value = ""; 
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
    
    // Ukrywanie sugestii po kliknięciu poza nimi
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

// --- Zarządzanie Widokami ---

/** Powrót do widoku głównego (wyszukiwania). */
function showMainView() {
    mainView.classList.remove('hidden-view');
    countryDetailsView.classList.add('hidden-view');
    siteFooter.classList.add('hidden-view');
    currentCountryData = null;
    // Zniszczenie instancji wykresu
    if (currencyChartInstance) {
        currencyChartInstance.destroy();
        currencyChartInstance = null;
    }
}

/** Wyświetla szczegóły wybranego kraju. */
function showCountryDetails(country) {
    currentCountryData = country;
    
    // Uzupełnienie danych kraju
    countryFlag.src = country.flags.svg;
    countryFlag.alt = `Flag of ${country.name}`;
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
    
    setConversionDisplay(baseCurrency, targetCurrency, isSupported); // Aktualizacja konwertera
    
    // Resetowanie przycisków okresu wykresu i ustawienie domyślnego
    document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
    const defaultBtn = document.querySelector('.chart-btn[data-period="7"]');
    
    if (defaultBtn) defaultBtn.classList.add('active');
    
    // Obsługa wykresu i przeliczania walut
    if (isSupported && baseCurrency !== targetCurrency) {
        updateCurrencyConversion(baseCurrency);
        fetchAndRenderChart(baseCurrency, targetCurrency, defaultBtn.dataset.period);
    } else if (baseCurrency === targetCurrency) {
        showChartMessage(`Cannot display chart for the same currency. Change the currency in settings.`);
    } else {
         showChartMessage(`Currency ${baseCurrency} is not supported by the Frankfurter API. Chart unavailable.`); 
    }
    
    // Aktualizacja ikony ulubionych
    favoriteStar.classList.remove('fas', 'far');
    
    if (isFavorite(country.commonName)) {
        favoriteStar.classList.add('fas');
    } else {
        favoriteStar.classList.add('far');
    }
    
    // Zmiana widoku
    mainView.classList.add('hidden-view')
    countryDetailsView.classList.remove('hidden-view');
    siteFooter.classList.remove('hidden-view');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Odświeżenie animacji AOS
    if (typeof AOS !== 'undefined') { 
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                AOS.refreshHard(); 
            });
        });
    }
}

// --- Funkcje Walutowe ---

/** Pobiera najnowszy kurs walut. */
async function fetchLatestRate(baseCurrency, targetCurrency) {
    if (baseCurrency === 'N/A') {
        return { rate: null, error: "Country currency is unknown." };
    }
    if (!availableCurrencies[baseCurrency] || !availableCurrencies[targetCurrency]) {
        return { rate: null, error: `Currency ${baseCurrency} is not supported by the API.` }; 
    }


    try {
        const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetCurrency}`);
        const data = await response.json();

        if (data.rates && data.rates[targetCurrency]) {
            return { rate: data.rates[targetCurrency], error: null };
        } else {
            return { rate: null, error: `No current rate available for ${baseCurrency} to ${targetCurrency}.` };
        }
    } catch (error) {
        console.error("Błąd pobierania kursu:", error);
        return { rate: null, error: "Error connecting to the currency exchange API." };
    }
}

/** Aktualizuje wynik przeliczenia waluty. */
async function updateCurrencyConversion(baseCurrency) {
    const amount = parseFloat(currencyAmountInput.textContent) || 1;
    const targetCurrency = conversionCurrencySelect.value;

    const convertedAmountElement = convertedAmountSpan;

    const result = await fetchLatestRate(baseCurrency, targetCurrency);

    if (result.error) {
        convertedAmountElement.textContent = "N/A";
        return;
    }

    
    // Korekta ilości dla walut o bardzo niskiej wartości
    const adjustedAmount = amount;
    const rate = result.rate;

    
    const finalValue = adjustedAmount * rate;
    convertedAmountElement.textContent = formatConvertedValue(finalValue);
}

/** Oblicza daty dla wykresu historycznego. */
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

/** Pobiera historyczne kursy walut z API. */
async function fetchHistoricalRates(baseCurrency, targetCurrency, days) {
    const dates = getDates(days);
    
    const url = `https://api.frankfurter.app/${dates.startDate}..${dates.endDate}?from=${baseCurrency}&to=${targetCurrency}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.rates && Object.keys(data.rates).length > 0) {
            return data.rates;
        } else {
            return null; // Brak danych
        }
    } catch (error) {
        console.error("Błąd pobierania danych historycznych:", error);
        return null;
    }
}

/** Pobiera dane historyczne i renderuje wykres. */
async function fetchAndRenderChart(baseCurrency, targetCurrency, period) {
    chartMessageElement.classList.add('hidden-view');
    currencyChartCanvas.classList.remove('hidden-view');
    
    // Zniszczenie starej instancji wykresu
    if (currencyChartInstance) {
        currencyChartInstance.destroy();
        currencyChartInstance = null;
    }
    
    if (baseCurrency === targetCurrency) {
        showChartMessage(`Cannot display chart for the same currency. Change the currency in settings.`);
        return;
    }
    
    // Sprawdzenie wsparcia waluty bazowej
    if (baseCurrency === 'N/A' || !availableCurrencies.hasOwnProperty(baseCurrency)) {
        setConversionDisplay(baseCurrency, targetCurrency, false); 
        showChartMessage(`Currency ${baseCurrency} is not supported by the Frankfurter API. Chart unavailable.`);
        return;
    }

    const rates = await fetchHistoricalRates(baseCurrency, targetCurrency, period);

    if (!rates || Object.keys(rates).length === 0) {
        showChartMessage(`Failed to fetch historical data for ${baseCurrency} to ${targetCurrency} over ${period} days.`);
        return;
    }
    
    const labels = Object.keys(rates).sort();
    const dataPoints = labels.map(date => rates[date][targetCurrency]);
    
    // Dostosowanie kolorów do trybu ciemnego/jasnego
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    const chartColor = isDarkMode 
        ? getComputedStyle(document.documentElement).getPropertyValue('--button-color') 
        : getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
        
    const chartColorRgba = chartColor.trim() === '#005EFF' ? 'rgba(0, 94, 255, 0.1)' : 'rgba(94, 189, 158, 0.2)';

    currencyChartInstance = new Chart(currencyChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Rate of 1 ${baseCurrency} to ${targetCurrency}`,
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
                        text: 'Date'
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
                        text: `Value in ${targetCurrency}`
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


/** Wyświetla komunikat zamiast wykresu. */
function showChartMessage(message) {
    if (currencyChartInstance) {
        currencyChartInstance.destroy();
        currencyChartInstance = null;
    }
    currencyChartCanvas.classList.add('hidden-view');
    chartMessageElement.classList.remove('hidden-view');
    chartMessageElement.textContent = message;
}

// Listenery dla przycisków okresu wykresu (tydzień, miesiąc, rok)
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
                 showChartMessage(`Cannot display chart for the same currency. Change the currency in settings.`);
            }
        }
    });
});

/** Formatowanie przeliczonej wartości walutowej. */
function formatConvertedValue(value) {
    let digits = 2;

    if (value < 1) digits = 4;
    if (value < 0.01) digits = 6;
    if (value < 0.0001) digits = 8;

    // Usuwa końcowe zera
    return parseFloat(value.toFixed(digits)).toString();
}

/** Korekta ilości dla walut o bardzo niskiej wartości (np. zamiast 1 wyświetlamy 1000). */
function adjustSmallCurrencyAmount(amount, rate) {
    const converted = amount * rate;

    // Standardowe waluty – zachowaj oryginalną ilość
    if (converted >= 0.01) {
        return { newAmount: amount, multiply: 1 };
    }

    // Waluty o bardzo niskiej wartości (np. IDR, VND)
    let multiply = 1;
    let newAmount = amount;

    if (converted < 0.001) {
        multiply = 10000;
        newAmount = amount * multiply;
    } else if (converted < 0.01) {
        multiply = 1000;
        newAmount = amount * multiply;
    }

    return { newAmount, multiply };
}

favoriteStar.addEventListener('click', () => {
    if (currentCountryData) {
        toggleFavorite(currentCountryData);
    }
});



/* ==========================
   OBSŁUGA IKONY WYSZUKIWANIA I KLAWISZA ENTER
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

// Wspólna funkcja wyszukiwania
function triggerSearch(query, inDetailsView) {
    if (!query) return;

    // Szukanie kraju, który pasuje do zapytania (początek nazwy)
    const match = allCountries.find(c =>
        c.name.toLowerCase().startsWith(query.toLowerCase())
    );

    if (!match) {
        const suggestionsEl = inDetailsView ? document.getElementById("detailsSuggestions") : document.getElementById("suggestions");
        suggestionsEl.innerHTML = "";
        suggestionsEl.style.display = "none";
        return;
    }
    
    const inputToClear = inDetailsView ? detailsSearchInput : mainSearchInput;
    
    inputToClear.value = ""; 

    // Ukrycie sugestii i widoku głównego
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
