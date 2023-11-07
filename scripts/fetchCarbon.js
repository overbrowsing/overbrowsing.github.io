/********** Website Carbon **********/
fetch('/api/carbon') // Assuming your Node.js server is running on the same domain
  .then(response => {
    if (!response.ok) {
      throw new Error(`Fetch error: ${response.status} - ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    const resultsElement = document.getElementById('carbon');
    const renewableGrams = data.statistics.co2.renewable.grams;
    resultsElement.innerHTML = `This is a low-consumption site that uses just ${renewableGrams.toFixed(2)}g CO2e and runs on clean energy.`;
  })
  .catch(error => {
    console.error('Error:', error);
  });