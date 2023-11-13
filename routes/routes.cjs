const express = require('express');
const router = express.Router();
const fs = require('fs')


const carbonData = JSON.parse(fs.readFileSync('./cache/carbon-data.json', 'utf8'));
const aqiData = JSON.parse(fs.readFileSync('./cache/aqi-data.json', 'utf8'));

// Route for the index page
router.get('/', async function(req, res, next) {

  const data = {
    message: 'Hello world!',
    layout: 'layout.njk',
    title: 'Nunjucks example',
    carbonData: carbonData,
    aqiData: aqiData
  };

  res.render('index.njk', data);
});

// Route for the /feed page
router.get('/feed', async function(req, res, next) {
  const jsonData = JSON.parse(fs.readFileSync('./cache/data.json', 'utf8'));

  const data = {
    message: 'Feed!',
    layout: 'layout.njk',
    title: 'Nunjucks example 2',
    data: jsonData,
    carbonData: carbonData,
    aqiData: aqiData
  };

  res.render('feed.njk', data);
});

module.exports = router;
