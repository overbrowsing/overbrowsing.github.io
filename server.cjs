const express = require('express');
const path = require('path');
const fs = require('fs');

const port = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the '_site' directory
app.use(express.static(path.join(__dirname, '_site')));

// Dynamic route handler to serve .html files
app.get('/:page', (req, res) => {
  const { page } = req.params;
  const filePath = path.join(__dirname, '_site', `${page}.html`);

  // Check if the requested .html file exists
  if (page && fs.existsSync(filePath)) {
    // Send the requested .html file
    res.sendFile(filePath);
  } else {
    // If the requested .html file does not exist, send the 404 page
    res.status(404).sendFile(path.join(__dirname, '_site', '404.html'));
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
