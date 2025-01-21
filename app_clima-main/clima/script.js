const apiKey = 'eca924cc4dc7e450672b550f03e1fc73'; // Reemplaza con tu API Key
const city = 'Lima'; // Reemplaza con la ciudad que deseas

async function getWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error("Error fetching weather data: ", error);
    }
}

function displayWeather(data) {
    const location = document.getElementById('location');
    const temperature = document.getElementById('temperature');
    const weather = document.getElementById('weather');
    const wind = document.getElementById('wind');
    const time = document.getElementById('time');
    const weatherIcon = document.getElementById('weatherIcon');

    location.textContent = `${data.name}, ${data.sys.country}`;
    temperature.innerHTML = `<span class="temperature">${data.main.temp} °C</span>`;
    weather.textContent = `Clima: ${data.weather[0].description}`;
    wind.textContent = `Viento: ${data.wind.speed} m/s`;
    
    const currentTime = new Date();
    time.textContent = `Hora: ${currentTime.toLocaleTimeString()}`;

    // Obtener el icono del clima
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
}

// Llamada a la función para obtener el clima al cargar la página
getWeather();
