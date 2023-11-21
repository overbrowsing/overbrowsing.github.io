// server.js
const express = require('express');
const path = require('path');

const port = "3000";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '_site')));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
