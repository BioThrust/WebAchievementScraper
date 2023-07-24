const puppeteer = require('puppeteer');
const express = require('express');
let page;
async function login(steamID) {
  const browser = await puppeteer.launch({
    'args' : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  page = await browser.newPage();
  await page.goto('https://steamcommunity.com/login/home/?goto=profiles%2F76561198368720362');
  await page.waitForTimeout(4000);
  console.log('reached page')
  await page.type('input[type="text"]', 'lsdjfklsdjflksdjfkl');
  await page.type('input[type="password"]', 'SsdfS8676j');
  await page.click('button[type="submit"]');
  console.log('logged in')
  await page.waitForTimeout(4000);
  await page.screenshot({'path': 'oxylabs_js.png'})

}
login()
async function scrape(steamID) {
  await page.goto(`https://steamcommunity.com/profiles/${steamID}/games/?tab=all`);
  await page.waitForTimeout(1000);
  await page.screenshot({'path': 'oxddylabs_js.png'});
  let allGames = await page.$$eval('.gameslistitems_GamesListItemContainer_29H3o', games => games.map(game => game.textContent));
  await page.screenshot({'path': 'oxddsdfylabs_js.png'});
  console.log(allGames);
}

const app = express();

// Define a route for triggering the login process
app.get('/:steamID', async (req, res) => {
  try {
    const steamID = req.params.steamID;
    console.log('request received')
    await scrape(steamID)
    await page.waitForTimeout(6000)
    res.send('Login process completed.');
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
