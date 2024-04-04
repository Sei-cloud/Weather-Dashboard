document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('search-btn');
    const unitSwitcher = document.querySelectorAll('input[name="units"]');
    const searchHistory = document.getElementById('search-history');
    let selectedUnit = 'imperial'; // Default unit

    unitSwitcher.forEach(radio => {
        radio.addEventListener('change', function () {
            selectedUnit = this.value;
            const cityName = document.getElementById('city-input').value;
            renderWeather(cityName, selectedUnit);
        });
    });

    function getSearchHistory() {
        return JSON.parse(localStorage.getItem('searchHistory')) || [];
    }

    function saveSearchHistory(cityName) {
        let history = getSearchHistory();
        if (!history.includes(cityName)) {
            history.unshift(cityName);
            localStorage.setItem('searchHistory', JSON.stringify(history));
        }
    }

    function renderSearchHistory() {
        searchHistory.innerHTML = '';
        const history = getSearchHistory();
        history.forEach(cityName => {
            const item = document.createElement('li');
            item.textContent = cityName;
            item.addEventListener('click', function () {
                renderWeather(cityName, selectedUnit);
            });
            searchHistory.appendChild(item);
        });
    }

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

    async function renderWeather(cityName, units) {
        saveSearchHistory(cityName);
        renderSearchHistory();

        const weatherContainer = document.getElementById('weather-container');
        weatherContainer.innerHTML = ''; // Clear previous results

        const weatherData = await fetchWeatherData(cityName, units);

        weatherData.list.forEach(forecast => {
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

    searchBtn.addEventListener('click', function () {
        const cityName = document.getElementById('city-input').value;
        renderWeather(cityName, selectedUnit);
    });

});
