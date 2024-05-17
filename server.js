const puppeteer = require("puppeteer");
const express = require('express');
const fs = require("fs");
const hbs = require('handlebars')
const path = require('path')
const data = require("./db.json");
const moment = require("moment");

const app = express();

const compile = async function (templateName, data) {
  const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
  const html = await fs.readFileSync(filePath, 'utf-8');
  return hbs.compile(html)(data);
}

hbs.registerHelper('dateFormat', function (value, format) {
  return moment(value).format(format)
});

async function getPDF () {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const content = await compile('shot-list', data)

  await page.setContent(
    content
  );
  // await page.emulateMedia("screen");
  const pdf = await page.pdf({
    path: "mypdf.pdf",
    format: "a4",
    printBackground: true,
  });

  browser.close()
  return pdf
  // await browser.close();
  // process.exit();
};

app.get('/', async (req, res) => {
  // 'view' ? 'inline' : 'attachment'
  const pdf = await getPDF();
  res.set({
    'Content-Type': 'application/pdf',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': 0,
    'Content-Length': pdf?.length,
    'Content-Disposition': `inline; filename="shot-list.pdf"`,
  });
  res.end(pdf)
})

app.listen(4000, () => {
  console.log('listening on port 4000...')
})