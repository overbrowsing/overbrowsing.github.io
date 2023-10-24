/********** Website Carbon **********/
fetch(`https://api.websitecarbon.com/site?url=https://overbrowsing.com`)
  .then(response => response.json())
  .then(data => {
    const resultsElement = document.getElementById('carbon');
    const renewableGrams = data.statistics.co2.renewable.grams;
    resultsElement.innerHTML = `This page emits ${renewableGrams.toFixed(2)}g of CO2 • Running on clean energy`;
  });