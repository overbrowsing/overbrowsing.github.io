const aqi = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=51.5073219&lon=-0.1276474&appid=ac6a8e4517ccb8b2c12e6713125a2d34`).then(aqi => aqi.json());
const aqiValue = aqi.list[0].main.aqi;

function shouldStopWorkflow(aqiValue) {
  if (aqiValue < 3) {
    console.log('AQI today is: ' + aqiValue + '. Workflow is stopping.');
    process.exit(1); // Exit with a non-zero code to indicate failure
  }
  console.log('AQI today is: ' + aqiValue + '. Workflow can continue.');
}