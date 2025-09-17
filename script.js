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
    
    // Nature Background references
    const sunnyBg = document.getElementById('sunny-bg');
    const rainyBg = document.getElementById('rainy-bg');
    const cloudyBg = document.getElementById('cloudy-bg');

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
            updateWeatherBackground(forecastData.list[0].weather[0].description);

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
    
    // =================================================================
    // ▼▼▼ UPDATED FORECAST FUNCTION FOR RELIABLE 5-DAY DISPLAY ▼▼▼
    // =================================================================
    function displayForecast(data) {
        forecastContainer.innerHTML = '';
        const dailyData = {};

        // Group forecast items by date
        for (const item of data.list) {
            const date = new Date(item.dt_txt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(item);
        }

        // Get the next 5 unique days, starting from tomorrow
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const forecastDays = Object.keys(dailyData).filter(date => date !== today).slice(0, 5);

        for (const date of forecastDays) {
            const dayItems = dailyData[date];
            if (!dayItems || dayItems.length === 0) continue;

            // Find the weather icon from around midday for a representative icon
            const middayItem = dayItems.find(item => new Date(item.dt_txt).getHours() >= 12) || dayItems[0];
            const iconUrl = `https://openweathermap.org/img/wn/${middayItem.weather[0].icon}@2x.png`;
            
            // Calculate min and max temps for the day
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

    function updateWeatherBackground(description) {
        const desc = description.toLowerCase();
        
        // Hide all backgrounds first
        sunnyBg.style.opacity = '0';
        rainyBg.style.opacity = '0';
        cloudyBg.style.opacity = '0';

        // Show the correct background with a fade-in effect
        if (desc.includes('sun') || desc.includes('clear')) {
            sunnyBg.style.opacity = '1';
        } else if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('storm')) {
            rainyBg.style.opacity = '1';
        } else if (desc.includes('cloud') || desc.includes('overcast') || desc.includes('haze') || desc.includes('mist')) {
            cloudyBg.style.opacity = '1';
        } else {
            cloudyBg.style.opacity = '1';
        }
    }
});
