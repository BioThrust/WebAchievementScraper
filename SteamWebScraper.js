const express = require('express');

const app = express();

// Define a route for triggering the login process
app.get('/:steamID', async (req, res) => {
  try {
    const steamID = req.params.steamID; // Take the SteamID in the  url of the website and use it as a function parameter to scrape that profile
    console.log('request received')
    await scrape(steamID)
    await page.waitForTimeout(6000)
    res.send(dict);
  } catch (err) {
    await page.screenshot({ 'path': 'd.png' })
    console.error('Error during login:', err);
    res.status(500).send('Error during login.');
  }
});

// Start the server and listen on a specific port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}.`);
});
