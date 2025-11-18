const settingsIcon = document.getElementById('settingsIcon');
const settingsMenu = document.getElementById('settingsMenu');
const favoritesButton = document.getElementById('favoritesButton');
const favoritesOverlay = document.getElementById('favoritesOverlay');
const closeFavorites = document.getElementById('closeFavorites');
const darkModeToggle = document.getElementById('darkModeToggle'); 
const body = document.body;
const siteLogo = document.getElementById('siteLogo');
const suggestionsBox=document.querySelector("#suggestionsBox")
const searchBox=document.querySelector(".search-box")


//Motywy 
function setDarkMode(isDark) {
    if (isDark) {
        body.classList.add('dark-mode');
        siteLogo.src = 'assets/ciemne_logo.png'; 
    } else {
        body.classList.remove('dark-mode');
        siteLogo.src = 'assets/jasne_logo.png';
    }
    localStorage.setItem('darkMode', isDark);
}

document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'; 
    if (isDarkMode) {
        darkModeToggle.checked = true;
    }
    setDarkMode(isDarkMode);
});

settingsIcon.addEventListener('click', () => {
    settingsIcon.classList.toggle('rotated');
    settingsMenu.classList.toggle('open');
});

favoritesButton.addEventListener('click', () => {
    favoritesOverlay.classList.add('visible');
});

closeFavorites.addEventListener('click', () => {
    favoritesOverlay.classList.remove('visible');
});

darkModeToggle.addEventListener('change', (event) => {
    setDarkMode(event.target.checked);
});

async function hint() {
    
    const input = document.querySelector(".search-input");
    const suggestions = document.querySelector("#suggestions");
    let countries = [];

    try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,translations");
        const data = await res.json();
        countries = data.map(c => c.translations?.pol?.common || c.name.common)
                        .sort((a,b) => a.localeCompare(b, "pl"));
        console.log("Pobrano krajów:", countries.length);
    } catch(err) {
        console.error("Błąd fetch:", err);
        input.placeholder = "Błąd pobierania krajów";
        return;
    }

    input.addEventListener("input", () => {
        const value = input.value.trim().toLowerCase();
        suggestions.innerHTML = "";

        if (!value) {
            suggestions.style.display = "none";
            return;
        }
        
        const filtered = countries.filter(name => name.toLowerCase().startsWith(value)).slice(0,10);

        filtered.forEach(name => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.textContent = name;
            div.addEventListener("click", () => {
                input.value = name;
                suggestions.innerHTML = "";
                suggestions.style.display = "none";
            });
            suggestions.appendChild(div);
        });
        
        suggestions.style.display = filtered.length ? "block" : "none";
        
        
        
    });

    document.addEventListener("click", e => {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.innerHTML = "";
            suggestions.style.display = "none";
            
        }
        
    });

    
    
}

document.addEventListener("DOMContentLoaded", hint);
