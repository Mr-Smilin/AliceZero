const http = require('http');

const hostName = 'localhost';
const port = 10000;

const server = http.createServer((req,res) => {
    res.statusCode = 200;
    res.setHeader = ('content-Type','text/html');
    res.end('<h1>This is find.</h1>');
})

exports.start = (() => server.listen(port));