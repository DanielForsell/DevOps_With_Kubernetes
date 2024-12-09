const Koa = require('koa')
const app = new Koa()
const fs = require('fs');

const PORT = process.env.PORT || 3000
const crypto = require('crypto')

app.use(async ctx => {
    if (ctx.path.includes('favicon.ico')) return
    const randomString = crypto.randomUUID();
    const time = new Date().toISOString();
    console.log(time,": " ,randomString);
    ctx.body = `${time}: ${randomString}`

    if(fs.existsSync('/data/pingpong.txt')) {
        const logs = fs.readFileSync('/data/pingpong.txt', 'utf8');
        ctx.body = `${time}: ${randomString}\nping / pongs: ${logs}`
    }
})

app.listen(PORT)