/********** Website Carbon **********/
fetch(`https://api.websitecarbon.com/site?url=https://overbrowsing.com`)
  .then(response => response.json())
  .then(data => {
    const resultsElement = document.getElementById('carbon');
    const renewableGrams = data.statistics.co2.renewable.grams;
    resultsElement.innerHTML = `This is a low-consumption site that uses just ${renewableGrams.toFixed(2)}g CO2e and runs on clean energy.`;
  });
