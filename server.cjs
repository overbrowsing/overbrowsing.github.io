const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');

const routes = require('./routes/index.cjs');
const dateFilter = require('nunjucks-date-filter');


const port = "3000";
const app = express();


function setUpNunjucks() {

  let env = nunjucks.configure('views', {
      autoescape: true,
      express: app
  });

  // note that 'date' is the function name you'll use in the template. As shown in nunjucks-date-filter's readme
  env.addFilter('date', dateFilter);

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
