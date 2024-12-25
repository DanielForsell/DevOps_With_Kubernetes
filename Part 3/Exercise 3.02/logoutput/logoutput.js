const express = require('express');
const app = express();
const axios = require('axios');
const { Pool } = require('pg');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;

// PostgreSQL setup
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

// Initialize table
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pongs (
                id SERIAL PRIMARY KEY,
                count INTEGER NOT NULL DEFAULT 0
            );
            INSERT INTO pongs (count) VALUES (0) ON CONFLICT DO NOTHING;
        `);
        console.log('Database initialized');
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
};

initDB();

app.get('/', async (req, res) => {
    try {
        const pingpongres = await axios.get('http://ping-pong-app-svc:2346/pingpong');
        const randomString = crypto.randomUUID();
        const time = new Date().toISOString();

        // Save new count to database
        await pool.query('UPDATE pongs SET count = $1 WHERE id = 1', [pingpongres.data.pingpong]);
        res.status(200)
        console.log(`${time}: ${randomString}`, '\n', pingpongres.data.pingpong);
        res.send(`${time}: ${randomString}\nPing / Pongs: ${pingpongres.data.pingpong}`);

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});