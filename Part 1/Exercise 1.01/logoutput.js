const { timeStamp } = require('console');
const crypot = require('crypto')

const randomString = crypto.randomUUID();

const logOutput = () => {
    const time = new Date().toISOString();
    console.log(time,": " ,randomString);

    setTimeout(logOutput, 5000);
}

logOutput();