const puppeteer = require('puppeteer');
const axios = require('axios');
let page;
let allGames;
let actualGameName;
let fractionText;
var dict = {};
let achievmentName;
let achievements = [];
let counter = 0;
let achieveUnlockTime;
let completed;
let achievementArray = [];
let workers = process.env.WEB_CONCURRENCY || 2;
const Queue = require('bull');


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
async function login(steamID) {
    const browser = await puppeteer.launch({
        'args': [
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
    await page.screenshot({ 'path': 'oxylabs_js.png' })

}
login()
async function scrape(steamID) {
    if (/[a-z]/i.test(steamID)) {
        await page.goto(`https://steamcommunity.com/profiles/${steamID}/games/?tab=all`);
        console.log('dmn bro')
    } else {
        await page.goto(`https://steamcommunity.com/profiles/${steamID}/games/?tab=all`); // Go to base achievment+game page
        console.log('went here done that')
    }

    let currentURL = page.url()
    let array = []
    let gameNames = []
    let fractionTexts = []
    await page.waitForSelector('.gameslistitems_GamesListItemContainer_29H3o')
    allGames = await page.$$('.gameslistitems_GamesListItemContainer_29H3o'); // Search for Games
    
    console.log(allGames)
    for (let i = 0; i < allGames.length; i++) { // Loop through games
        let game = await allGames[i].$('.gameslistitems_AchievementsProgressLabel_3eZML'); // Search for Achievment section of game
        let gameName = await allGames[i].$('.gameslistitems_GameName_22awl') // Search for Name of Game
        actualGameName = await page.evaluate(gameName => gameName.textContent, gameName) // Get the text attribute
        gameNames.push(actualGameName)

        if (game != null) { // If the Game has achievments
            let fraction = await allGames[i].$('.gameslistitems_AchievementsFraction_1YRRM') // Search for achievment fraction
            fractionText = await page.evaluate(fraction => fraction.textContent, fraction);
            let gameText = await page.evaluate(game => game.textContent, game);
            fractionTexts.push(fractionText)
            await array.push(gameText);

            console.log(actualGameName + ' ' + fractionText)

            // Click on achievment button and Scan all achievments.

            try {
                await game.click()
                await page.waitForSelector('.achieveTxt h3', { timeout: 2000 });
                let tempAchievements = await page.$$('.achieveRow')
                console.log(tempAchievements.length)
                dict[gameNames[i]] = {}
                dict[gameNames[i]]['achievements'] = {}
                for (let x = 0; x < tempAchievements.length; x++) { //Loop through achievements
                    let achievements = await tempAchievements[x].$eval('.achieveTxt h3', elements => elements.textContent); //achievement name

                    achievementArray.push(achievements);

                    // Get Achievement Unlock Time and Completion Status
                    try {

                        achieveUnlockTime = await tempAchievements[x].$eval('.achieveUnlockTime', elements => elements.textContent);
                        let cleanedString = achieveUnlockTime.replace(/\n|\t/g, '');
                        completed = true

                        dict[gameNames[i]]['achievements'][achievementArray[x]] = {}
                        dict[gameNames[i]]['achievements'][achievementArray[x]]['achieveUnlockTime'] = cleanedString
                        dict[gameNames[i]]['achievements'][achievementArray[x]]['completion'] = completed
                    } catch {
                        completed = false
                        dict[gameNames[i]]['achievements'][achievementArray[x]] = {}
                        dict[gameNames[i]]['achievements'][achievementArray[x]]['achieveUnlockTime'] = "N/A"
                        dict[gameNames[i]]['achievements'][achievementArray[x]]['completion'] = completed
                    }

                }


                // dict[gameNames[i]] = { 'achievements': achievementArray }




                await page.goBack();
                await page.waitForSelector('.gameslistitems_GamesListItemContainer_29H3o')
                allGames = await page.$$('.gameslistitems_GamesListItemContainer_29H3o');
            } catch {
                await page.goBack();
                allGames = await page.$$('.gameslistitems_GamesListItemContainer_29H3o');
                continue;
            }

        } else {
            console.log(actualGameName + ' No Game Achievments')
            fractionTexts.push('0/0')
        }
        achievementArray = []
        console.log(achieveUnlockTime)
    }

    await page.waitForTimeout(2000)
    await page.screenshot({ 'path': 'oxddsdfylabs_js.png' });
    for (let i = 0; i < gameNames.length; i++) {
        if (!dict.hasOwnProperty(gameNames[i])) {
            // If the key does not exist, create it and set its value to an empty object
            dict[gameNames[i]] = {};
        }
        dict[gameNames[i]]['achievementProgress'] = fractionTexts[i];
    }
    responseQueue.add(dict)
}


let maxJobsPerWorker = 50;

requestQueue.process(maxJobsPerWorker, async (job) => {
    console.log('received')
    let steamID = job.steamID
    await scrape(steamID)
});

