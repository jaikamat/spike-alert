const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Get filenames
let filenames = fs.readdirSync('./scrape/scraped_data');

/**
 * Wraps POST request in async function to allow synchronous iteration
 * @param {object} dataOpts
 */
async function postCards(dataOpts) {
    const res = await axios(dataOpts);
    return res;
}

/**
 * Iterates over each scraped filename, creating formdata and uploading it to the db via POST.
 */
(async function upload() {
    for (let i = 0; i < filenames.length; i++) {
        let form = new FormData();
        form.append('prices', fs.createReadStream(`./scrape/scraped_data/${filenames[i]}`));

        let data = {
            method: 'POST',
            url: 'http://localhost:1337/upload',
            data: form,
            headers: { ...form.getHeaders() }
        };

        await postCards(data)
            .then(() => {
                console.log(`${filenames[i]} uploaded`);
            })
            .catch(console.log);
    }
})();
