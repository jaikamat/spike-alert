const moment = require('moment');
const _ = require('lodash');

/**
 * Takes two numbers and calculates their percent change
 * @param {number} current
 * @param {number} past
 */
function calculateChangeOverTime(current, past) {
    if (current === null || past === null) return null;
    return (((current - past) / past) * 100).toFixed(2);
}

/**
 * Creates an organized price trend calculation with nonfoil and foil prices
 * (where applicable) over a specified number of days
 * TODO: Pare this down. It's repititious, and looks difficult to maintain
 * @param {array} datesGrouped Dates and their corresponding priceHistory array
 * @param {array} orderedDatesUniq The unique dates from scraping (may have multiple of same date)
 * @param {number} lengthOfTime How many days out to calculate percent change of price
 */
function collatePriceTrends(datesGrouped, orderedDatesUniq, lengthOfTime) {
    let priceTrend = {};

    const daysEnum = {
        DAILY: 1,
        TWO_DAY: 2,
        THREE_DAY: 3,
        WEEKLY: 7,
        MONTHLY: 30,
        YEARLY: 365
    };

    // Always comparing it to the most recent day
    const currentDate = orderedDatesUniq[0];
    // Grab the most recent price1 (datesGrouped sorts with date increasing, hence the .reverse)
    const currentPrices = datesGrouped[currentDate].reverse()[0];
    const currentPrice1 = currentPrices.price1;
    const currentPrice2 = currentPrices.price2;

    switch (lengthOfTime) {
        case 'DAILY':
            if (orderedDatesUniq.length <= daysEnum.DAILY) {
                priceTrend.price1 = null;
                priceTrend.price2 = null;
            } else {
                const pastDate = orderedDatesUniq[daysEnum.DAILY];
                const pastPrices = datesGrouped[pastDate].reverse()[0];
                const pastPrice1 = pastPrices.price1;
                const pastPrice2 = pastPrices.price2;

                priceTrend.price1 = calculateChangeOverTime(currentPrice1, pastPrice1);
                priceTrend.price2 = calculateChangeOverTime(currentPrice2, pastPrice2);
            }
            break;

        case 'TWO_DAY':
            if (orderedDatesUniq.length <= daysEnum.TWO_DAY) {
                priceTrend.price1 = null;
                priceTrend.price2 = null;
            } else {
                const pastDate = orderedDatesUniq[daysEnum.TWO_DAY];
                const pastPrices = datesGrouped[pastDate].reverse()[0];
                const pastPrice1 = pastPrices.price1;
                const pastPrice2 = pastPrices.price2;

                priceTrend.price1 = calculateChangeOverTime(currentPrice1, pastPrice1);
                priceTrend.price2 = calculateChangeOverTime(currentPrice2, pastPrice2);
            }
            break;

        case 'THREE_DAY':
            if (orderedDatesUniq.length <= daysEnum.THREE_DAY) {
                priceTrend.price1 = null;
                priceTrend.price2 = null;
            } else {
                const pastDate = orderedDatesUniq[daysEnum.THREE_DAY];
                const pastPrices = datesGrouped[pastDate].reverse()[0];
                const pastPrice1 = pastPrices.price1;
                const pastPrice2 = pastPrices.price2;

                priceTrend.price1 = calculateChangeOverTime(currentPrice1, pastPrice1);
                priceTrend.price2 = calculateChangeOverTime(currentPrice2, pastPrice2);
            }
            break;

        case 'WEEKLY':
            if (orderedDatesUniq.length <= daysEnum.WEEKLY) {
                priceTrend.price1 = null;
                priceTrend.price2 = null;
            } else {
                const pastDate = orderedDatesUniq[daysEnum.WEEKLY];
                const pastPrices = datesGrouped[pastDate].reverse()[0];
                const pastPrice1 = pastPrices.price1;
                const pastPrice2 = pastPrices.price2;

                priceTrend.price1 = calculateChangeOverTime(currentPrice1, pastPrice1);
                priceTrend.price2 = calculateChangeOverTime(currentPrice2, pastPrice2);
            }
            break;

        case 'MONTHLY':
            if (orderedDatesUniq.length <= daysEnum.MONTHLY) {
                priceTrend.price1 = null;
                priceTrend.price2 = null;
            } else {
                const pastDate = orderedDatesUniq[daysEnum.MONTHLY];
                const pastPrices = datesGrouped[pastDate].reverse()[0];
                const pastPrice1 = pastPrices.price1;
                const pastPrice2 = pastPrices.price2;

                priceTrend.price1 = calculateChangeOverTime(currentPrice1, pastPrice1);
                priceTrend.price2 = calculateChangeOverTime(currentPrice2, pastPrice2);
            }
            break;

        case 'YEARLY':
            if (orderedDatesUniq.length <= daysEnum.YEARLY) {
                priceTrend.price1 = null;
                priceTrend.price2 = null;
            } else {
                const pastDate = orderedDatesUniq[daysEnum.YEARLY];
                const pastPrices = datesGrouped[pastDate].reverse()[0];
                const pastPrice1 = pastPrices.price1;
                const pastPrice2 = pastPrices.price2;

                priceTrend.price1 = calculateChangeOverTime(currentPrice1, pastPrice1);
                priceTrend.price2 = calculateChangeOverTime(currentPrice2, pastPrice2);
            }
            break;

        case 'ALL_TIME':
            if (orderedDatesUniq.length <= 1) {
                priceTrend.price1 = null;
                priceTrend.price2 = null;
            } else {
                const pastDate = orderedDatesUniq[orderedDatesUniq.length - 1];
                const pastPrices = datesGrouped[pastDate].reverse()[0];
                const pastPrice1 = pastPrices.price1;
                const pastPrice2 = pastPrices.price2;

                priceTrend.price1 = calculateChangeOverTime(currentPrice1, pastPrice1);
                priceTrend.price2 = calculateChangeOverTime(currentPrice2, pastPrice2);
            }
            break;
    }
    return priceTrend;
}

/**
 * Takes in a priceHistory array and returns the most recent price objects from it,
 * yielding the current price
 * @param {array} priceHistory
 */
function getCurrentPrice(priceHistory) {
    const sortedByDate = _.sortBy(priceHistory, 'date').reverse();
    const recentElement = sortedByDate[0];

    return {
        price1: recentElement.price1,
        price2: recentElement.price2
    };
}

/**
 * Takes in an array of priceHistory objects (have date and price info)
 * and returns their price changes over various predefined time ranges
 * @param {array} priceHistory
 */
function createPriceTrends(priceHistory) {
    // Group price history by single date (may be more than 1 scrape per day)
    let datesGrouped = _.groupBy(priceHistory, el => {
        return moment(new Date(el.date)).startOf('day');
    });

    // Order the dates chronologically
    let orderedDatesUniq = _.keys(datesGrouped).sort(
        (a, b) => moment(new Date(b)) - moment(new Date(a))
    );

    return {
        daily: collatePriceTrends(datesGrouped, orderedDatesUniq, 'DAILY'),
        two_day: collatePriceTrends(datesGrouped, orderedDatesUniq, 'TWO_DAY'),
        three_day: collatePriceTrends(datesGrouped, orderedDatesUniq, 'THREE_DAY'),
        weekly: collatePriceTrends(datesGrouped, orderedDatesUniq, 'WEEKLY'),
        monthly: collatePriceTrends(datesGrouped, orderedDatesUniq, 'MONTHLY'),
        yearly: collatePriceTrends(datesGrouped, orderedDatesUniq, 'YEARLY'),
        all_time: collatePriceTrends(datesGrouped, orderedDatesUniq, 'ALL_TIME')
    };
}

/**
 * Returns the current foil miltipler for the current card price
 */
function calculateFoilMultiplier(priceHistory) {
    const currentPrices = priceHistory[priceHistory.length - 1];
    const price1 = currentPrices.price1;
    const price2 = currentPrices.price2;

    if (price1 && price2) return (price2 / price1).toFixed(2);
    else return null;
}

module.exports.createPriceTrends = createPriceTrends;
module.exports.calculateFoilMultiplier = calculateFoilMultiplier;
module.exports.getCurrentPrice = getCurrentPrice;
