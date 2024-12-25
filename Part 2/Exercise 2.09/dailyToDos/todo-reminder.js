const express = require('express');
const app = express();
const axios = require('axios')

const PORT = process.env.PORT || 3000

async function getRandomURL() {
    const response = await axios.get('https://en.wikipedia.org/wiki/Special:Random', {
        maxRedirects: 5 
    });
    return response.request.res.responseUrl; 
}

app.use('', async (req, res) => {
    try {
        const ranUrl = await getRandomURL()
        console.log('Read ', ranUrl);
        res.send(`Read ${ranUrl}`);
    } catch (error) {
        console.error('Error fetching randomURL:', error.message);
        res.status(500).send('Error fetching randomURL:');
    }
})

app.listen(PORT, () => {
    console.log(`Todo reminder app listening on port ${PORT}`);
})