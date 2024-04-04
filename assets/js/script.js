document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('search-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const unitSwitcher = document.querySelectorAll('input[name="units"]');
    const searchHistory = document.getElementById('search-history');
    const cityInput = document.getElementById('city-input');
    let selectedUnit = 'metric'; // Default unit

    // Function to fetch weather data from API
    async function fetchWeatherData(cityName, units) {
        const apiKey = '176d1f0e6c5199e9868dd8dddfbf78a4';
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${units}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    // Function to save searched city to local storage
    function saveSearchHistory(cityName) {
        let history = getSearchHistory();
        if (!history.includes(cityName)) {
            history.unshift(cityName);
            localStorage.setItem('searchHistory', JSON.stringify(history));
        }
    }

    // Function to retrieve search history from local storage
    function getSearchHistory() {
        return JSON.parse(localStorage.getItem('searchHistory')) || [];
    }

    // Function to render search history
    function renderSearchHistory() {
        searchHistory.innerHTML = '';
        const history = getSearchHistory();
        history.forEach(cityName => {
            const listItem = document.createElement('li');
            listItem.textContent = cityName;
            listItem.classList.add('search-history-item');
            searchHistory.appendChild(listItem);
        });
    }



    // Function to render weather data
    async function renderWeather(cityName, units) {
        saveSearchHistory(cityName);
        renderSearchHistory();

        const weatherContainer = document.getElementById('weather-container');
        weatherContainer.innerHTML = ''; // Clear previous results

        const weatherData = await fetchWeatherData(cityName, units);

        if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
            alert('No weather data found for the entered city. Please enter a valid city name.');
            return;
        }

        const uniqueDates = new Set(); // To store unique dates
        const uniqueForecasts = []; // To store unique forecasts for each unique date

        weatherData.list.forEach(forecast => {
            // Extract date without time
            const date = new Date(forecast.dt * 1000);
            const dateString = date.toDateString();

            // Check if this date is unique
            if (!uniqueDates.has(dateString)) {
                // Add date to set of unique dates
                uniqueDates.add(dateString);

                // Add this forecast to the unique forecasts array
                uniqueForecasts.push(forecast);
            }
        });

        uniqueForecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dateString = date.toDateString();
            const temperature = forecast.main.temp;
            const humidity = forecast.main.humidity;
            const windSpeed = forecast.wind.speed;
            const condition = forecast.weather[0].main;
            const iconCode = forecast.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

            const forecastElement = document.createElement('div');
            forecastElement.classList.add('forecast');

            forecastElement.innerHTML = `
                <div class="date">${dateString}</div>
                <div class="temperature">${temperature}°${units === 'metric' ? 'C' : 'F'}</div>
                <div class="humidity">Humidity: ${humidity}%</div>
                <div class="wind-speed">Wind Speed: ${windSpeed} ${units === 'metric' ? 'm/s' : 'mph'}</div>
                <div class="condition">${condition}</div>
                <img class="weather-icon" src="${iconUrl}" alt="${condition}">
            `;

            weatherContainer.appendChild(forecastElement);
        });
    }


    // Event listener for unit switcher change
 // Event listener for unit switcher change
unitSwitcher.forEach(radio => {
    radio.addEventListener('change', function () {
        selectedUnit = this.value;
        const cityName = cityInput.value.trim();
        if (cityName !== '') {
            renderWeather(cityName, selectedUnit);
        }
    });
});


    // Event listener for clear search history button click
    clearHistoryBtn.addEventListener('click', function () {
        localStorage.removeItem('searchHistory');
        renderSearchHistory();
    });

  searchBtn.addEventListener('click', function () {
    const cityName = cityInput.value.trim();
        renderWeather(cityName, selectedUnit);
});

    // Render weather for the last searched city when the page loads
    const lastSearchedCity = getSearchHistory()[0];
    if (lastSearchedCity) {
        renderWeather(lastSearchedCity, selectedUnit);
    }
});
