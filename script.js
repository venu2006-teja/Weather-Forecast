const API_KEY = "a103589b765705548c968e195ea1873a";
const cityInput = document.getElementById("city-input");
const citySearchBtn = document.getElementById("city-search-btn");
const pincodeInput = document.getElementById("pincode-input");
const pincodeSearchBtn = document.getElementById("pincode-search-btn");
const weatherDisplay = document.getElementById("weather-display");
const locationName = document.getElementById("location-name");
const tempElement = document.getElementById("temp");
const conditionsElement = document.getElementById("conditions");
const humidityElement = document.getElementById("humidity");
const windSpeedElement = document.getElementById("wind-speed");
const weatherIcon = document.getElementById("weather-icon");
const errorMessage = document.getElementById("error-message");

// Central function to fetch data and handle errors
async function fetchWeatherData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City/Pincode not found or network error');
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        weatherDisplay.classList.add("hidden");
        errorMessage.textContent = "Location not found. Please try again.";
        errorMessage.classList.remove("hidden");
    }
}

// Displays the weather data on the page
function displayWeather(data) {
    weatherDisplay.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    locationName.textContent = data.name;
    tempElement.textContent = Math.round(data.main.temp);
    conditionsElement.textContent = data.weather[0].description;
    humidityElement.textContent = data.main.humidity;
    windSpeedElement.textContent = data.wind.speed;
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
}

// Gets the user's location using the Geolocation API
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
                fetchWeatherData(url);
            },
            (error) => {
                console.error("Geolocation error:", error);
                errorMessage.textContent = "Location access denied. Enter a city or pincode.";
                errorMessage.classList.remove("hidden");
            }
        );
    } else {
        errorMessage.textContent = "Geolocation is not supported by your browser.";
        errorMessage.classList.remove("hidden");
    }
}

// Event Listeners for search buttons and input fields
document.addEventListener("DOMContentLoaded", getUserLocation);

citySearchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        fetchWeatherData(url);
    }
});

pincodeSearchBtn.addEventListener("click", () => {
    const pincode = pincodeInput.value.trim();
    if (pincode) {
        // The API requires a country code, using 'in' for India as a default
        const url = `https://api.openweathermap.org/data/2.5/weather?zip=${pincode},in&appid=${API_KEY}&units=metric`;
        fetchWeatherData(url);
    }
});

cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        citySearchBtn.click();
    }
});

pincodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        pincodeSearchBtn.click();
    }
});