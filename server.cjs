const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');

const routes = require('./routes/index.cjs');

const port = "3000";
const app = express();


function setUpNunjucks() {

  let env = nunjucks.configure('views', {
      autoescape: true,
      express: app
  });
  // Custom filter function to convert date string to a JavaScript Date object
  const parseDate = function (dateString) {
    return new Date(dateString);
  };

  env.addFilter('parseDate', parseDate);
}

setUpNunjucks();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/')));

// Use the main router for all routes
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
