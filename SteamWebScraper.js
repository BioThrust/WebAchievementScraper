const puppeteer = require('puppeteer');
const express = require('express');
let page;
let allGames;
let actualGameName;
let fractionText;
var dict = {};
async function login(steamID) {
  const browser = await puppeteer.launch({
    'args' : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  page = await browser.newPage();
  await page.goto('https://steamcommunity.com/login/home/?goto=profiles%2F76561198368720362'); // Go to Steam Login Page
  await page.waitForTimeout(2000);
  console.log('reached page')
  await page.type('input[type="text"]', 'lsdjfklsdjflksdjfkl'); //Login Details
  await page.type('input[type="password"]', 'SsdfS8676j');
  await page.click('button[type="submit"]');
  console.log('logged in')
  await page.waitForTimeout(2000);
  await page.screenshot({'path': 'oxylabs_js.png'})

}
login()
async function scrape(steamID) {
  await page.goto(`https://steamcommunity.com/profiles/${steamID}/games/?tab=all`); // Go to base achievment+game page
  await page.waitForTimeout(1000);
  await page.screenshot({'path': 'oxddylabs_js.png'});
  let currentURL = page.url()
  let array = []
  let gameNames = []
  let fractionTexts = []
  allGames = await page.$$('.gameslistitems_GamesListItemContainer_29H3o'); // Search for Games

  for(let i=0;i<allGames.length; i++){ // Loop through games
    let game = await allGames[i].$('.gameslistitems_AchievementsProgressLabel_3eZML'); // Search for Achievment section of game
    let gameName = await allGames[i].$('.gameslistitems_GameName_22awl') // Search for Name of Game
    actualGameName = await page.evaluate(gameName => gameName.textContent, gameName) // Get the text attribute
    gameNames.push(actualGameName)
    
    if(game!=null){ // If the Game has achievments
      let fraction = await allGames[i].$('.gameslistitems_AchievementsFraction_1YRRM') // Search for achievment fraction
      fractionText = await page.evaluate(fraction => fraction.textContent, fraction);
      let gameText = await page.evaluate(game => game.textContent, game);
      fractionTexts.push(fractionText)
      await array.push(gameText);

      console.log(actualGameName+' '+fractionText)

      // Click on achievment button and Scan all achievments.
      
    } else{
      console.log(actualGameName+' No Game Achievments')
      fractionTexts.push(' ')
    }
  }

  await page.waitForTimeout(2000)
  await page.screenshot({'path': 'oxddsdfylabs_js.png'});
  for(let i=0;i<gameNames.length;i++){
    dict[gameNames[i]] = fractionTexts[i];
  }
}

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
    console.error('Error during login:', err);
    res.status(500).send('Error during login.');
  }
});

// Start the server and listen on a specific port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}.`);
});
