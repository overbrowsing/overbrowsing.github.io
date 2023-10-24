async function fetchWeather() {
  // please don't steal my weather api key
  const aqi = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=51.5073219&lon=-0.1276474&appid=ac6a8e4517ccb8b2c12e6713125a2d34`).then(aqi => aqi.json());
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
  document.body.style.backgroundColor = color;
}
fetchWeather();
