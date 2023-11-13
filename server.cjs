const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');

const routes = require('./routes/index.cjs');

const port = "3000";
const app = express();

// Configure Nunjucks with 'views' as the templates directory
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/')));

// Use the main router for all routes
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
