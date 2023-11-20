const express = require('express');
const router = express.Router();
const fs = require('fs')


const carbonData = JSON.parse(fs.readFileSync('./cache/carbon-data.json', 'utf8'));
const aqiData = JSON.parse(fs.readFileSync('./cache/aqi-data.json', 'utf8'));

// Route for the index page
router.get('/', async function(req, res, next) {

  const data = {
    page: 'home',
    layout: 'layout.njk',
    carbonData: carbonData,
    aqiData: aqiData
  };

  res.render('index.njk', data);
});

// Route for the /feed page
router.get('/feed', async function(req, res, next) {
  const jsonData = JSON.parse(fs.readFileSync('./cache/data.json', 'utf8'));
  const currentDate = new Date();
  const data = {
    page: 'feed',
    layout: 'layout.njk',
    data: jsonData,
    carbonData: carbonData,
    aqiData: aqiData,
    currentDate: currentDate
  };

  res.render('feed.njk', data);
});

// Route for the /about page
router.get('/about', async function(req, res, next) {
  const data = {
    page: 'about',
    layout: 'layout.njk',
    carbonData: carbonData,
    aqiData: aqiData
  };
  res.render('about.njk', data);
});



module.exports = router;
