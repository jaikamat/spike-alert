// get list of filenames
// loop
// each file => upload to server, continue

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Get filenames to iterate over
let filenames = fs.readdirSync('./scrape/scraped_data');

// Create new form
const form = new FormData();

// Append the 'prices' property for read by route
form.append('prices', fs.createReadStream(`./scrape/scraped_data/${filenames[0]}`));

// Wrap post request in async function to allow synchronous iteration
async function postCards(dataOpts) {
    const res = await axios(dataOpts);
    return res;
}

let data = {
    method: 'POST',
    url: 'http://localhost:1337/upload',
    data: form,
    headers: { ...form.getHeaders() }
};

postCards(data).then(console.log);
