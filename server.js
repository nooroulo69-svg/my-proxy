const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

express.urlencoded({ extended: true });

let browser;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });
  }
  return browser;
}

async function handleRequest(url, res) {
  try {
    const b = await getBrowser();
    const page = await b.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    await page.evaluate(() => {
      document.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('http')) {
          a.setAttribute('href', '/?url=' + encodeURIComponent(href));
        }
      });
      document.querySelectorAll('form').forEach(form => {
        const action = form.getAttribute('action');
        if (action) {
          form.setAttribute('action', '/?url=' + encodeURIComponent(action));
          form.setAttribute('method', 'get');
        }
      });
    });

    const content = await page.content();
    await page.close();
    res.send(content);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
}

app.get('/', async (req, res) => {
  const url = req.query.url || 'https://wikipedia.org';
  await handleRequest(url, res);
});

app.post('/', async (req, res) => {
  const url = req.query.url || 'https://wikipedia.org';
  await handleRequest(url, res);
});

app.get('*', async (req, res) => {
  const url = req.query.url || 'https://wikipedia.org';
  await handleRequest(url, res);
});

app.post('*', async (req, res) => {
  const url = req.query.url || 'https://wikipedia.org';
  await handleRequest(url, res);
});

app.listen(8080, () => console.log('Proxy running on port 8080'));
