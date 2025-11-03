/* 
  Weather App Script
  File: script.js
  Description: Handles city search, API fetching, and weather data updates.
  Author: Vedant Parashar
*/

// ===== IMPORTS =====
import dayjs from "https://esm.sh/dayjs";


// ===== CONSTANTS =====
const API_KEY = "af27a5f280f61370320dfb5028c52c04";


// ===== ELEMENT SELECTORS =====
const searchInput = document.querySelector(".searchBar__input");
const searchButton = document.querySelector(".searchBar__btn");

const sectionSearchCity = document.querySelector(".js-search-city");
const sectionWeatherInfo = document.querySelector(".js-weather-info");
const sectionNotFound = document.querySelector(".js-not-found");
const locationButton = document.querySelector(".js-location-btn");
const cityNameElem = document.querySelector(".js-city");
const dateElem = document.querySelector(".js-date");
const skyImgElem = document.querySelector(".js-sky-img");
const tempElem = document.querySelector(".js-temp");
const skyTextElem = document.querySelector(".js-sky-text");
const humidityElem = document.querySelector(".js-humidity");
const windSpeedElem = document.querySelector(".js-wind-speed");
const forecastContainer = document.querySelector('.js-forecast-list');
const sectionLoading = document.querySelector(".js-loading");


// ===== EVENT HANDLERS =====
function handleSearch() {
  const city = searchInput.value.trim();
  if (!city) return;

  updateWeatherInfo(city);
  searchInput.value = "";
  searchInput.blur();
}

function handleEnterKey(event) {
  if (event.key === "Enter") handleSearch();
}

function handleLocationSearch() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        const weatherData = await response.json();

        if (weatherData.name) {
          updateWeatherInfo(weatherData.name);
        } else {
          alert("Unable to fetch weather for your location.");
        }
      } catch (error) {
        console.error("Error fetching location weather:", error);
        alert("Failed to get weather for your location.");
      }
    },
    () => {
      alert("Unable to retrieve your location.");
    }
  );
}


// ===== EVENT LISTENERS =====
searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keydown", handleEnterKey);
locationButton.addEventListener("click", handleLocationSearch);

// ===== API REQUEST =====
async function fetchWeatherData(city) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
  );
  return await response.json();
}

async function fetchForecastData(city) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`);
  const forecastRawData = await response.json();

  // == Filter Forecast Data ==
  const cityDate = forecastRawData.list[0].dt_txt.split(' ')[0];
  const timeTaken = `12:00:00`;
  const forecastData = [];
  forecastRawData.list.forEach(forecastItem => {
    if (forecastItem.dt_txt.includes(timeTaken) && !forecastItem.dt_txt.includes(cityDate)) {
      forecastData.push(forecastItem);
    }
  });
  return forecastData;
}

// ===== REQUIRED FUNCTIONS =====
function getWeatherIcon(Id) {
  if (Id < 233) return `/assets/weather/thunderstorm.svg`;
  if (Id < 322) return `/assets/weather/drizzle.svg`;
  if (Id < 531) return `/assets/weather/rain.svg`;
  if (Id < 623) return `/assets/weather/snow.svg`;
  if (Id < 782) return `/assets/weather/atmosphere.svg`;
  if (Id < 801) return `/assets/weather/clear.svg`;
  if (Id < 805) return `/assets/weather/clouds.svg`;
}

// ===== UPDATE UI =====
async function updateWeatherInfo(city) {

  try {
    // SHOW LOADER
    sectionSearchCity.style.display = "none";
    sectionWeatherInfo.style.display = "none";
    sectionNotFound.style.display = "none";
    sectionLoading.style.display = "flex";


    const weatherData = await fetchWeatherData(city);
    const forecastData = await fetchForecastData(city);

    sectionLoading.style.display = "none";

    // City not found
    if (weatherData.message === "city not found") {
      sectionSearchCity.style.display = "none";
      sectionWeatherInfo.style.display = "none";
      sectionNotFound.style.display = "flex";
      return;
    }

    // City found → show info
    sectionNotFound.style.display = "none";
    sectionSearchCity.style.display = "none";
    sectionWeatherInfo.style.display = "flex";

    // Fill data
    cityNameElem.innerHTML = `${weatherData.name}, ${weatherData.sys.country}`;
    dateElem.innerHTML = dayjs().format("ddd, DD MMM");
    skyImgElem.src = `${getWeatherIcon(weatherData.weather[0].id)}`;
    tempElem.innerHTML = `${Math.round(weatherData.main.temp)} &deg;C`;
    skyTextElem.innerHTML = weatherData.weather[0].main;
    humidityElem.innerHTML = `${weatherData.main.humidity}%`;
    windSpeedElem.innerHTML = `${weatherData.wind.speed} M/s`;

    console.log(forecastData);
    let forecastHTML = ``;
    forecastData.forEach(dayForecast => {
      const formattedDate = dayjs(dayForecast.dt_txt).format("MMM DD");
      const dailyTemp = Math.round(dayForecast.main.temp);

      forecastHTML += `
    <div class="forecastCard">
      <h4 class="forecastCard__date text--regular">${formattedDate}</h4>
      <img src="${getWeatherIcon(dayForecast.weather[0].id)}" alt="Weather Icon" class="forecastCard__icon">
      <h4 class="forecastCard__temp text--bold">${dailyTemp} &deg;C</h4>
    </div>
  `;
    });

    forecastContainer.innerHTML = forecastHTML;

  } catch (error) {
    console.error("Error fetching or displaying weather data:", error);
    sectionSearchCity.style.display = "none";
    sectionWeatherInfo.style.display = "none";
    sectionLoading.style.display = "none";
    sectionNotFound.style.display = "flex";
  }
}