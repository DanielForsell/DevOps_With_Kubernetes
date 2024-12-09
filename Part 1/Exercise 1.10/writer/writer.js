const Koa = require('koa')
const app = new Koa()
const fs = require('fs');
const crypto = require('crypto')

const PORT = process.env.PORT || 3001

setInterval(() => {
    const randomString = crypto.randomUUID();
    const hash = crypto.createHash('sha256').update(randomString).digest('hex');
    const time = new Date().toISOString();
    console.log(time,": " ,hash);
    const logs = `${time}: ${hash}\n`
    fs.appendFileSync('/data/timestamps.txt', logs)
}, 5000)

app.listen(PORT, () => {
    console.log(`Writer app listening on port ${PORT}`);
})