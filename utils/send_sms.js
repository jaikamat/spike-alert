const dotenv = require('dotenv').config();
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

function createTextFromCards(cards) {
    const header = `Winners over a two-day period:\n`;
    const textBody = cards
        .map(card => {
            return `${card.name} | ${card.setCode} | ${card.priceTrends.two_day.price1.toFixed(
                0
            )}%`;
        })
        .join('\n');

    return header + textBody;
}

function sendCardsSMS(cards) {
    return client.messages
        .create({
            body: createTextFromCards(cards),
            from: process.env.TWILIO_NUMBER,
            to: process.env.MY_NUMBER
        })
        .then(msg => console.log(`Twilio message sent - sid: ${msg.sid}`));
}

module.exports = sendCardsSMS;
