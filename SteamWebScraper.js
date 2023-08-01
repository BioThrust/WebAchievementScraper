const express = require('express');
let completed = false
const app = express();
const redis = require('redis');
const redisURL = process.env.REDIS_URL;
if (process.env.REDIS_URL) {
  var rtg = require("url").parse(process.env.REDIS_URL);
  var client = require("redis").createClient(rtg.port, rtg.hostname);

  client.auth(rtg.auth.split(":")[1]);
} else {
  var client = require("redis").createClient();
}

// Define a route for triggering the login process
app.get('/:steamID', async (req, res) => {
  try {
    console.log('yo')
    const steamID = req.params.steamID; // Take the SteamID in the  url of the website and use it as a function parameter to scrape that profile
    client.set('steamID', steamID);
    client.set('completed', false);
    console.log('yes')

    if (completed == false) {
      res.send({
        "jobId": "12345",
        "status": false,
        "result": {
          "data": "some data"
        }
      });
    } else {
      res.send(dict)
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Error during login.');
  }
});
app.get('/result', async (req, res) => {
  try {
    const completed = await client.getAsync('completed');
    if (completed === 'true') {
      const result = await client.getAsync('result');
      res.send({
        "status": true,
        "result": result
      });
    } else {
      res.send({
        "status": false,
        "message": "Job not completed yet"
      });
    }
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
