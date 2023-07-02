const express = require('express');
const webdriver = require('selenium-webdriver');
const { By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const app = express();
const port = 3000;

let driver;
let currentResult = [];

app.get('/roleta', async (req, res) => {
  try {
    if (!driver) {
      const options = new chrome.Options();
      options.headless();

      driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

      await driver.get('https://casino.betfair.com/pt-br/c/roleta');
      await driver.sleep(3000);
    }

    const lista = await getRoletaNumbers();

    if (isResultUpdated(lista)) {
      currentResult = lista;
      console.log(currentResult);
    }

    res.json(currentResult);
  } catch (error) {
    console.error('Ocorreu um erro durante a extração dos números da roleta:', error);
    res.status(500).send('Ocorreu um erro ao obter os números da roleta.');
  }
});

async function getRoletaNumbers() {
  const lista = [];

  for (let x = 0; x < 8; x++) {
    const elems = await driver.findElements(By.className('number'));
    const elem2 = await elems[x].getText();
    lista.push(elem2);
  }

  return lista;
}

function isResultUpdated(newResult) {
  if (currentResult.length !== newResult.length) {
    return true;
  }

  for (let i = 0; i < currentResult.length; i++) {
    if (currentResult[i] !== newResult[i]) {
      return true;
    }
  }

  return false;
}

app.on('close', () => {
  if (driver) {
    driver.quit();
  }
});

app.listen(port, () => {
  console.log(`A API está rodando em http://localhost:${port}`);
});
