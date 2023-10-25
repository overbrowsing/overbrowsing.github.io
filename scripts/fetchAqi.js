// Fetches the aqi, prints the AQI quality to HTML (we can remove)
// Changes the background color of the site slightly depending on the AQI level. On worse days, the site becomes more red.
// Air Pollution is calculated a little differently on the open weather api, on a scale from 1-5
// Read more about that here https://openweathermap.org/api/air-pollution

async function fetchAqi() {
  const aqi = await getAirQualityData();
  const aqiValue = aqi.list[0].main.aqi;

  const airQualityDescription = getAirQualityDescription(aqiValue);
  displayAirQuality(airQualityDescription);

  const backgroundColor = calculateBackgroundColor(aqiValue);
  document.body.style.backgroundColor = backgroundColor;
}

async function getAirQualityData() {
  const response = await fetch(
    "https://api.openweathermap.org/data/2.5/air_pollution?lat=51.5073219&lon=-0.1276474&appid=ac6a8e4517ccb8b2c12e6713125a2d34"
  );
  return response.json();
}

// Assigns AQI numerical value to qualitative value
function getAirQualityDescription(aqiValue) {
  const airQualityTable = {
    "1": "Good",
    "2": "Fair",
    "3": "Moderate",
    "4": "Poor",
    "5": "Very Poor",
  };
  return airQualityTable[aqiValue];
}

// Prints the AQI qualitative value to HTML
function displayAirQuality(airQualityDescription) {
  const airQualityElement = document.getElementById("aqi");
  airQualityElement.textContent = `The air quality today is ${airQualityDescription}.`;
}

// Calculates a change of the background color to a red tone on bad AQI days
function calculateBackgroundColor(aqiValue) {
  let redness = 27;

  if (aqiValue > 2) {
    redness = Math.round(27 + (aqiValue - 1) * 5.4);
  }

  return `#${redness}2a24`;
}

fetchAqi();
