const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Get filenames
let filenames = fs.readdirSync('./scrape/scraped_data');

/**
 * Iterates over each scraped filename, creating formdata and uploading it to the db via POST.
 */
async function uploadScrapedFiles() {
    for (let i = 0; i < filenames.length; i++) {
        let form = new FormData();
        form.append('prices', fs.createReadStream(`./scrape/scraped_data/${filenames[i]}`));

        let data = {
            method: 'POST',
            url: 'http://localhost:1337/upload',
            data: form,
            headers: { ...form.getHeaders() }
        };

        await axios(data)
            .then(() => {
                console.log(`${filenames[i]} uploaded`);
            })
            .catch(console.log);
    }
}

/**
 * Updates the prices after all the scraped json has been persisted
 */
async function updatePrices() {
    return await axios.post('http://localhost:1337/upload/update-prices');
}

async function seed() {
    await uploadScrapedFiles();
    await updatePrices();
}

seed()
    .then(() => console.log('Database seeded'))
    .catch(err => console.log(err));
