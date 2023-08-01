const express = require('express');
let completed = false
const app = express();
const Queue = require('bull');
let dict = null;
let userDict = {}
let steamIDArray = []
const redis = require('redis');
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const requestQueue = new Queue('requests', REDIS_URL);
const responseQueue = new Queue('responses', REDIS_URL);
// Create a Redis client
const client = redis.createClient(REDIS_URL);

// Event listeners to handle Redis client connection and error
client.on('connect', () => {
  console.log('Connected to Redis server');
});

client.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});
responseQueue.process(async (job) => {
  // handle incoming response here
  dict = job.data.dict;
  completed=true
  console.log('ITS FINALLY DONE')
  console.log(dict)
  userDict[steamIDArray[0]] = dict
  steamIDArray.shift()
  // send result back to client
});
// Define a route for triggering the login process
app.get('/steam/:steamID', async (req, res) => {
  try {
    console.log('yo');
    let steamID = req.params.steamID;
    steamIDArray.push(steamID)
    console.log('Steam ID:', steamID);

    let job = await requestQueue.add({ steamID }); // Pass steamID as the job data
    console.log('yes');

    let jobResult = await job.finished();


    if (dict!= null) {
      res.send(dict);
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
app.get('/result/:steamID', async (req, res) => {
  try {
    let steamID = req.params.steamID;
    if (dict) {
      res.send(userDict[steamID]);
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
