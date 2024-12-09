const Koa = require('koa');
const app = new Koa();
const PORT = process.env.PORT || 3000;
const fs = require('fs');

app.use(async ctx => {
    if (ctx.path.includes('favicon.ico')) return;
    
    if (fs.existsSync('/data/timestamps.txt')) {
        const data = fs.readFileSync('/data/timestamps.txt', 'utf8');
        ctx.body = data;
        console.log(data);
        
    } else {
        ctx.body = 'No data available.';
        console.log(`No data available.`);
    }
});

app.listen(PORT, () => {
    console.log(`Reader app listening on port ${PORT}`);
});