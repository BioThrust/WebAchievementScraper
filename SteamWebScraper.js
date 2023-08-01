// server.js - Your server logic resides here

const express = require('express');
const app = express();
const redis = require('redis');
const redisURL = process.env.REDIS_URL;
const scrape = require('./scraper'); // Import the `scrape` function

let client;

// Rest of your server code here
// ...

// Define a route for triggering the login process
app.get('/:steamID', async (req, res) => {
  try {
    console.log('yo');
    const steamID = req.params.steamID;
    console.log('Steam ID:', steamID);

    // Call the scrape function passing the steamID
    scrape(steamID).then((dict) => {
      if (dict) {
        res.send(dict);
      } else {
        res.send({
          "status": false,
          "message": "Job not completed yet"
        });
      }
    }).catch((err) => {
      console.error('Error during scraping:', err);
      res.status(500).send('Error during scraping.');
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Error during login.');
  }
});

// Start the server and listen on a specific port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}.`);
});
