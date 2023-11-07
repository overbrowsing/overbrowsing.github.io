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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
