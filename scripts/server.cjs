const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the root directory (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, '../')));


// Define a route to serve the index.html from the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/api/carbon', async (req, res) => {
  try {
    const response = await fetch('https://api.websitecarbon.com/site?url=https://overbrowsing.com');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
