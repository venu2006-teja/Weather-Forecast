document.addEventListener('DOMContentLoaded', () => {
    // Your API key is now included directly in the code.
    const apiKey = 'a103589b765705548c968e195ea1873a';

    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const weatherContent = document.getElementById('weather-content');
    const initialMessage = document.getElementById('initial-message');
    
    const currentCard = document.getElementById('current-weather-card');
    const effectsText = document.getElementById('effects-text');
    const forecastContainer = document.getElementById('forecast-container');

    searchButton.addEventListener('click', () => fetchWeather(cityInput.value));
    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') fetchWeather(cityInput.value);
    });

    function fetchWeather(city) {
        if (!city) {
            alert('Please enter a city name.');
            return;
        }

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        
        initialMessage.style.display = 'none';
        weatherContent.classList.remove('hidden');

        fetch(forecastUrl)
            .then(response => {
                if (!response.ok) throw new Error('City not found. Please check the spelling or try another city.');
                return response.json();
            })
            .then(data => {
                displayCurrentWeather(data.list[0], data.city.name);
                displayForecast(data);
            })
            .catch(error => {
                alert(error.message);
                weatherContent.classList.add('hidden');
                initialMessage.style.display = 'block';
            });
    }

    function displayCurrentWeather(currentData, cityName) {
        currentCard.innerHTML = `
            <h2>${cityName}</h2>
            <p class="current-temp">${Math.round(currentData.main.temp)}<span>°C</span></p>
            <p class="current-desc">${currentData.weather[0].description}</p>
            <div class="current-details">
                <p><strong>Feels like:</strong> ${Math.round(currentData.main.feels_like)}°C</p>
                <p><strong>Humidity:</strong> ${currentData.main.humidity}%</p>
                <p><strong>Wind:</strong> ${currentData.wind.speed} m/s</p>
            </div>
        `;
        
        // Update weather effects based on current conditions
        const effects = getWeatherEffects({
            rainProbability: (currentData.pop || 0) * 100,
            windSpeed: currentData.wind.speed,
            maxTemp: currentData.main.temp,
            humidity: currentData.main.humidity,
            description: currentData.weather[0].description
        });
        effectsText.innerHTML = effects;
    }

    function displayForecast(data) {
        forecastContainer.innerHTML = ''; // Clear previous forecast
        const addedDays = new Set();
    
        for (const item of data.list) {
            const dayOfWeek = new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'short' });
            
            if (!addedDays.has(dayOfWeek) && addedDays.size < 5) {
                addedDays.add(dayOfWeek);
                const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
                
                forecastContainer.innerHTML += `
                    <div class="forecast-card">
                        <h3>${dayOfWeek}</h3>
                        <img src="${iconUrl}" alt="${item.weather[0].description}">
                        <p class="forecast-temp">${Math.round(item.main.temp_max)}° / ${Math.round(item.main.temp_min)}°</p>
                    </div>
                `;
            }
        }
    }

    function getWeatherEffects(conditions) {
        let effects = [];
        if (conditions.rainProbability > 70) {
            effects.push("🌧️ **Heavy Rain Alert:** High chance of rain. Expect travel delays and carry an umbrella.");
        } else if (conditions.rainProbability > 40) {
            effects.push("🌦️ **Chance of Showers:** Light showers are possible. A waterproof jacket is recommended.");
        }
        
        if (conditions.windSpeed > 10) {
            effects.push("💨 **Strong Winds:** Be cautious outdoors. Secure any loose objects.");
        }
        
        if (conditions.maxTemp > 35) {
            effects.push("🔥 **Extreme Heat:** Stay hydrated and avoid direct sun during peak hours.");
        } else if (conditions.maxTemp < 5) {
            effects.push("❄️ **Cold Weather:** Bundle up! Wear multiple layers to stay warm.");
        }

        if (conditions.description.includes('fog')) {
            effects.push("🌫️ **Fog Warning:** Reduced visibility. Drive carefully.");
        }

        return effects.length > 0 ? effects.join('<br><br>') : "☀️ **Pleasant Conditions:** Enjoy the lovely weather! Perfect for outdoor activities.";
    }
});
