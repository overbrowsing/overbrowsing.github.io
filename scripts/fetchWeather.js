async function fetchWeather() {
  // const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const apiKey = "a767027338c3e647bc664f0b09493eb2";

  if (!apiKey) {
    console.error("API key not found. Make sure you've set it as a secret.");
    return;
  }

  const weather = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=imperial&q=London&APPID=${apiKey}`).then(weather => weather.json());
  const aqi = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=51.5073219&lon=-0.1276474&appid=${apiKey}`).then(aqi => aqi.json());
  const aqiValue = aqi.list[0].main.aqi;

  const airQualityTable = {
    "1": "Good",
    "2": "Fair",
    "3": "Moderate",
    "4": "Poor",
    "5": "Very Poor",
  };

  const airQualityDescription = airQualityTable[aqiValue];
  // Print to HTML
  const airQualityElement = document.getElementById("aqi");
  airQualityElement.textContent = `The air quality today is ${airQualityDescription}.`;


  // Calculate the red component of the color based on the AQI value with your provided equation, now 5 times more subtle.
  let redness = 27;

  if (aqiValue < 3) {
    // Keep the color the same when AQI is 1 or 2
    redness = 27;
  } else {
    // Adjust the color for AQI values greater than 2
    redness = Math.round(27 + (aqiValue - 1) * 5.4); // Divided by 10
  }


  // Set the background color based on the calculated components.
  const color = `#${redness}2a24`;
  console.log(color)
  // Set the background color of the entire body.
  document.body.style.backgroundColor = color;
}
fetchWeather();
