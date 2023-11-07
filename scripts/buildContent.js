const dataPath = '../cache/data.json';

fetch(dataPath)
  .then(response => response.json())
  .then(jsonData => {
    // Now that you have fetched the JSON data, you can use it in your code
    let filteredHtml = "";
    jsonData.forEach(element => {
      filteredHtml += "<div class='feed__item'>";

      if (element.content) {
        filteredHtml += "<p>" + element.content + "</p>";
      }
      if (element.image) {
        filteredHtml += "<div class='feed__image'><img src='cache/images/" + element.id + ".png' loading='lazy' /></div>";
      }
      if (element.title) {
        filteredHtml += "<span>" + element.title + "</span>";
      }
      if (element.source) {
        filteredHtml += "<a href=" + element.source.url + ">" + element.source.title + "</a>";
      }
      filteredHtml += "</div>";
    });
    document.querySelector('.feed').insertAdjacentHTML('beforeend', filteredHtml);
  })
  .catch(error => {
    console.error('Error:', error);
  });
