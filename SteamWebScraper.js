const puppeteer = require('puppeteer');
async function Login() {
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
Login();