const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/', async (req, res) => {
  const url = req.query.url || 'https://www.tiktok.com';
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const content = await page.content();
    await browser.close();
    res.send(content);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.listen(8080, () => console.log('Proxy running on port 8080'));
