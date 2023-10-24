async function fetchWeather() {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    console.error("API key not found. Make sure you've set it as a secret.");
    return;
  }

  const weather = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=imperial&q=London&APPID=${apiKey}`).then(weather => weather.json());
  const aqi = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=51.5073219&lon=-0.1276474&appid=${apiKey}`).then(aqi => aqi.json());

  console.log(weather.weather[0].description);
  console.log(weather.weather[0]);
  console.log(aqi);
}

fetchWeather();
