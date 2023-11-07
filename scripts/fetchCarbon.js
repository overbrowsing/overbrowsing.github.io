/********** Website Carbon **********/
// This only runs on build 
const dataPath = '/cache/carbon-data.json'; // Adjust the path to match your file location

fetch(dataPath)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Fetch error: ${response.status} - ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    // Now that you have fetched the JSON data, you can use it in your code
    const resultsElement = document.getElementById('carbon');
    const renewableGrams = data.statistics.co2.renewable.grams;
    resultsElement.innerHTML = `This is a low-consumption site that uses just ${renewableGrams.toFixed(2)}g CO2e and runs on clean energy.`;
  })
  .catch(error => {
    console.error('Error:', error);
  });
