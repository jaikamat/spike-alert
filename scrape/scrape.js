const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const setCodeJSON = require('./setcodes.json');
const fs = require('fs');
const progressBar = require('progress');

const BASE_URL = 'https://www.cardsphere.com';

/**
 * Wraps single-card data scraped from CardSphere
 */
class CardCS {
    constructor(card) {
        this.name = card.name;
        this.setCode = card.setCode;
        this.price = card.price;
        this.foilPrice = card.foilPrice;
    }

    /**
     * Retrieves setcodes from CardSphere image uri's:
     * Example: //cardimage.cardsphere.com/cards/Sets/4ED/Gaea's Liege.jpg
     * @param {string} url
     */
    static getSetCode(url) {
        // TODO:
        // These image links have somewhat disparate setcodes, which may not be three letters
        // One thing they share is having two or more uppercase non-numeric characters next to each other
        let entries = url.split('/');

        let setCode = entries.filter();

        return;
    }
}

/**
 * Fetches HTML for cheerio to parse
 * @param {string} url
 */
async function retrieveHTML(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);

    const $ = cheerio.load(bodyHTML);
    return $;
}

/**
 * Iterates over all cards in a set page,
 * collecting the card pricing data
 * @param {string} url
 */
function collectSetPageCardData($) {
    let rows = $('.cards ul > li');
    let cards = [];

    const setName = $('h3')
        .text()
        .trim();

    const setCode = setCodeJSON[setName];

    console.log(setCode);

    rows.each(function(index, el) {
        const name = $(this)
            .find('a')
            .text()
            .trim();

        const price1 = $(this)
            .children('span:nth-child(2)')
            .text()
            .trim();

        const price2 = $(this)
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
function findSetLinks($) {
    let links = [];

    $('.sets.row')
        .find('ul > li > a')
        .each((index, element) => {
            links.push($(element).attr('href'));
        });

    return processURLs(links);
}

// retrieveHTML(BASE_URL + '/sets')
//     .then($ => {
//         console.log(findSetLinks($));
//     })
//     .catch(err => console.log(err));

retrieveHTML(BASE_URL + '/sets/853')
    .then($ => {
        console.log(collectSetPageCardData($));
    })
    .catch(err => console.log(err));

// console.log(CardCS.getSetCode('//cardimage.cardsphere.com/cards/Sets/UDS/Goblin Gardener.jpg'));
