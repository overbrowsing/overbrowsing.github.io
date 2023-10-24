// TODO: Hide API Key

async function fetchWeather() {
  const weather = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=imperial&q=London&APPID=a767027338c3e647bc664f0b09493eb2`).then(weather => weather.json())
  const aqi = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=51.5073219&lon=-0.1276474&appid=a767027338c3e647bc664f0b09493eb2
`).then(aqi => aqi.json())

  console.log(weather.weather[0].description)
  console.log(weather.weather[0])
  console.log(aqi)
}
fetchWeather()