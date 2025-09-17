document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'a103589b765705548c968e195ea1873a';

    // Element references
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const weatherContent = document.getElementById('weather-content');
    const initialMessage = document.getElementById('initial-message');
    const currentCard = document.getElementById('current-weather-card');
    const effectsText = document.getElementById('effects-text');
    const forecastContainer = document.getElementById('forecast-container');
    
    // Background element references for Day and Night
    const backgroundElements = {
        sunnyDay: document.getElementById('sunny-day-bg'),
        cloudyDay: document.getElementById('cloudy-day-bg'),
        rainyDay: document.getElementById('rainy-day-bg'),
        clearNight: document.getElementById('clear-night-bg'),
        cloudyNight: document.getElementById('cloudy-night-bg'),
        rainyNight: document.getElementById('rainy-night-bg')
    };
    
    // Event listeners
    searchButton.addEventListener('click', () => fetchWeather(cityInput.value));
    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') fetchWeather(cityInput.value);
    });

    async function fetchWeather(input) {
        if (!input) {
            alert('Please enter a city name or pincode.');
            return;
        }
        
        initialMessage.style.display = 'none';
        weatherContent.classList.remove('hidden');

        let forecastUrl;
        if (/^\d{6}$/.test(input)) {
            forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${input},IN&appid=${apiKey}&units=metric`;
        } else {
            forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${input}&appid=${apiKey}&units=metric`;
        }

        try {
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) throw new Error('Location not found.');
            const forecastData = await forecastResponse.json();

            const pincodeToDisplay = /^\d{6}$/.test(input) ? input : forecastData.city.name;

            displayCurrentWeather(forecastData.list[0], forecastData.city.name, pincodeToDisplay);
            displayForecast(forecastData);
            updateWeatherBackground(forecastData.list[0], forecastData.city);

        } catch (error) {
            alert(error.message);
            weatherContent.classList.add('hidden');
            initialMessage.style.display = 'block';
        }
    }

    function displayCurrentWeather(currentData, cityName, pincode) {
        const pincodeHTML = pincode !== cityName ? `<p class="current-pincode">Pincode: ${pincode}</p>` : '';
        currentCard.innerHTML = `<h2>${cityName}</h2>${pincodeHTML}<p class="current-temp">${Math.round(currentData.main.temp)}<span>°C</span></p><p class="current-desc">${currentData.weather[0].description}</p><div class="current-details"><p><strong>Feels like:</strong> <span>${Math.round(currentData.main.feels_like)}°C</span></p><p><strong>Humidity:</strong> <span>${currentData.main.humidity}%</span></p><p><strong>Wind:</strong> <span>${currentData.wind.speed} m/s</span></p></div>`;
        const conditions = { description: currentData.weather[0].description };
        effectsText.innerHTML = getWeatherEffects(conditions);
    }
    
    function displayForecast(data) {
        forecastContainer.innerHTML = '';
        const dailyData = {};

        for (const item of data.list) {
            const date = new Date(item.dt_txt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(item);
        }

        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const forecastDays = Object.keys(dailyData).filter(date => date !== today).slice(0, 5);

        for (const date of forecastDays) {
            const dayItems = dailyData[date];
            if (!dayItems || dayItems.length === 0) continue;

            const middayItem = dayItems.find(item => new Date(item.dt_txt).getHours() >= 12) || dayItems[0];
            const iconUrl = `https://openweathermap.org/img/wn/${middayItem.weather[0].icon}@2x.png`;
            
            const minTemp = Math.min(...dayItems.map(item => item.main.temp_min));
            const maxTemp = Math.max(...dayItems.map(item => item.main.temp_max));
            
            const dayOfWeek = new Date(dayItems[0].dt_txt).toLocaleDateString('en-US', { weekday: 'short' });

            forecastContainer.innerHTML += `
                <div class="forecast-card">
                    <h3>${dayOfWeek}</h3>
                    <img src="${iconUrl}" alt="${middayItem.weather[0].description}">
                    <p class="forecast-temp">${Math.round(maxTemp)}° / ${Math.round(minTemp)}°</p>
                </div>
            `;
        }
    }

    function getWeatherEffects(conditions) {
        let effects = [];
        const description = conditions.description.toLowerCase();
        if (description.includes('rain') || description.includes('drizzle')) {
            effects.push("🌧️ **Rain Alert:** Showers are expected. Don't forget your umbrella!");
        } else if (description.includes('cloud') || description.includes('overcast')) {
             effects.push("☁️ **Cloudy Skies:** It's an overcast day, good for activities that don't require bright sun.");
        } else if (description.includes('clear') || description.includes('sun')) {
            effects.push("☀️ **Sunny Day:** Perfect weather to be outside. Wear sunscreen!");
        }
        return effects.length > 0 ? effects.join('<br>') : "🌤️ **Mild Conditions:** Enjoy your day!";
    }

    function updateWeatherBackground(currentData, cityData) {
        // Hide all backgrounds first to ensure a clean transition
        for (const key in backgroundElements) {
            if (backgroundElements[key]) {
                backgroundElements[key].style.opacity = '0';
            }
        }

        const desc = currentData.weather[0].description.toLowerCase();
        const currentTimeUTC = currentData.dt;
        const sunriseUTC = cityData.sunrise;
        const sunsetUTC = cityData.sunset;

        // Determine if it's currently daytime at the location
        const isDay = currentTimeUTC >= sunriseUTC && currentTimeUTC < sunsetUTC;

        let activeBg = null;

        if (isDay) {
            // Daytime Logic
            if (desc.includes('sun') || desc.includes('clear')) {
                activeBg = backgroundElements.sunnyDay;
            } else if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('storm')) {
                activeBg = backgroundElements.rainyDay;
            } else { // Default to cloudy for mist, haze, clouds, etc.
                activeBg = backgroundElements.cloudyDay;
            }
        } else {
            // Nighttime Logic
            if (desc.includes('clear')) {
                activeBg = backgroundElements.clearNight;
            } else if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('storm')) {
                activeBg = backgroundElements.rainyNight;
            } else { // Default to cloudy night
                activeBg = backgroundElements.cloudyNight;
            }
        }

        // Show the correct background with a fade-in effect
        if (activeBg) {
            activeBg.style.opacity = '1';
        } else {
            // Fallback to a default if something goes wrong
            (isDay ? backgroundElements.cloudyDay : backgroundElements.cloudyNight).style.opacity = '1';
        }
    }
});
