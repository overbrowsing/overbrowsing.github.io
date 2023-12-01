const aqi = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=51.5073219&lon=-0.1276474&appid=ac6a8e4517ccb8b2c12e6713125a2d34`).then(aqi => aqi.json());
const aqiValue = aqi.list[0].main.aqi;

// This function executes in a daily workflow build in main.yml
// It checks the AQI value and stops the build if it is below a set value.
function shouldStopWorkflow(aqiValue) {
  if (aqiValue < 3) {
    console.log('::set-output name=stopWorkflow::true'); // Set output variable
    console.log('AQI today is: ' + aqiValue + '. Workflow is stopping.');
    process.exit(0); // Exit with a zero code to indicate successful completion
  }
  console.log('AQI today is: ' + aqiValue + '. Workflow can continue.');
}

shouldStopWorkflow(aqiValue);