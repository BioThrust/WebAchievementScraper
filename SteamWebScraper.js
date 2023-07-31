const express = require('express');
let completed = false
const app = express();
const Queue = require('bull');
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const requestQueue = new Queue('requests', REDIS_URL);
const responseQueue = new Queue('responses', REDIS_URL);
responseQueue.process(async (job) => {
  // handle incoming response here
  let dict = job.data.dict;
  completed=true
  // send result back to client
});
// Define a route for triggering the login process
app.get('/:steamID', async (req, res) => {
  try {
    console.log('yo')
    const steamID = req.params.steamID; // Take the SteamID in the  url of the website and use it as a function parameter to scrape that profile
    let job = await requestQueue.add(steamID);
    console.log('yes')
    
   
    if(completed==false){
      res.send({
        "jobId": "12345",
        "status": false,
        "result": {
          "data": "some data"
        }
      });
    } else{
      res.send(dict)
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
