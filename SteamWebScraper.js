const puppeteer = require('puppeteer');
const express = require('express');

async function login() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://steamcommunity.com/login/home/?goto=profiles%2F76561198368720362');
  await page.waitForTimeout(4000);
  
  await page.type('input[type="text"]', 'lsdjfklsdjflksdjfkl');
  await page.type('input[type="password"]', 'SsdfS8676j');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  await page.screenshot({'path': 'oxylabs_js.png'})
  await browser.close();
}

const app = express();

// Define a route for triggering the login process
app.get('/login', async (req, res) => {
  try {
    await login();
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
