const Koa = require('koa')
const app = new Koa()
const PORT = process.env.PORT || 3000
const { timeStamp } = require('console');
const crypot = require('crypto')

app.use(async ctx => {
    if (ctx.path.includes('favicon.ico')) return
    const randomString = crypto.randomUUID();
    const time = new Date().toISOString();
    console.log(time,": " ,randomString);
    ctx.body = `${time}: ${randomString}`
})

app.listen(PORT)