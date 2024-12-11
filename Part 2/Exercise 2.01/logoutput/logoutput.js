const express = require('express');
const app = express();
const axios = require('axios')

const PORT = process.env.PORT || 3000
const crypto = require('crypto')

app.get('/', async (req, res) => {
    try {
        const pingpongres = await axios.get('http://ping-pong-app-svc:2346/pingpong')
        const randomString = crypto.randomUUID();
        const time = new Date().toISOString();
        console.log(time,": " ,randomString, '\n', pingpongres.data.pingpong);
        res.send(`${time}: ${randomString}\nPing / Pongs: ${pingpongres.data.pingpong}`);
    } catch (error) {
        console.error('Error fetching from Ping-pong:', error.message);
        res.status(500).send('Failed to fetch pong count');
    }
})

app.listen(PORT, () => {
    console.log(`Log-OutPut app listening on port ${PORT}`);
})