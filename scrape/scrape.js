const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const setCodeJSON = require('./setcodes.json');
const fs = require('fs');
const moment = require('moment');
const ProgressBar = require('progress');

const BASE_URL = 'https://www.cardsphere.com';

// See http://momentjs.com/docs/#/displaying/format/ for formatting
const filenameDatetime = moment().format('MM-DD-YYYY--x');

/**
 * Iterates over all cards in a set page,
 * collecting the card pricing data
 * @param {string} url
 */
function collectSetPageCardData($) {
    let cards = [];
    let rows = $('.cards ul > li');

    const setName = $('h3')
        .text()
        .trim();

    const setCode = setCodeJSON[setName];

    console.log(setName, setCode);

    rows.each(function(index, element) {
        const name = $(element)
            .find('a')
            .text()
            .trim();

        const price1 = $(element)
            .children('span:nth-child(2)')
            .text()
            .trim();

        const price2 = $(element)
            .children('span:nth-child(3)')
            .text()
            .trim();

        cards.push({
            name: name,
            price1: price1,
            price2: price2,
            setCode: setCode
        });
    });

    return cards;
}

/**
 * Returns an array of whole url's based on
 * the BASE_URL, for puppeteer to process
 * @param {array} urls
 */
function processURLs(urls) {
    return urls.map(el => BASE_URL + el);
}

/**
 * Finds all set links from a cheerio object,
 * and returns a list of complete urls
 */
function collectSetLinks($) {
    let links = [];

    $('.sets.row')
        .find('ul > li > a')
        .each((index, element) => {
            links.push($(element).attr('href'));
        });

    return processURLs(links);
}

/**
 * Launches puppeteer and scrapes sets, then navigates to each set
 * page, scraping card data and returning a list array of cards
 */
async function run() {
    let cardList = [];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(BASE_URL + '/sets');

    const bodyHTML = await page.evaluate(() => document.body.innerHTML);

    // This is the list of all sets:
    const $_sets = cheerio.load(bodyHTML);

    const links = collectSetLinks($_sets);

    fs.writeFileSync('./scrape/scraped_data/links.json', JSON.stringify(links));

    // let collectBar = new ProgressBar('Collecting cards [:bar] :elapsed sec elapsed', {
    //     total: 50
    // });

    // Iterate over links, collecting card data:
    for (let i = 0; i < links.length; i++) {
        await page.goto(links[i]);
        await page.waitFor(750); // Must wait for ::before and ::after pseudo elements to populate in UI
        const cardHTML = await page.evaluate(() => document.body.innerHTML);
        const $_cards = cheerio.load(cardHTML);
        const cards = collectSetPageCardData($_cards);

        cardList = cardList.concat(cards);
        // collectBar.tick(50 / links.length);
    }

    browser.close();
    return cardList;
}

// Initialize the scrape
run()
    .then(cards => {
        fs.writeFileSync(`./scrape/scraped_data/${filenameDatetime}.json`, JSON.stringify(cards));
        console.log('Scrape finished!');
    })
    .catch(console.error);
