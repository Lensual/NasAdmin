'use strict';
var express = require('express');
var app = express();
var fs = require("fs");

//¶ÁÎÄ¼þ¼Ð
app.get('/api/readDir', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    try {
        res.end(JSON.stringify(fs.readdirSync(req.query.path)));
    } catch (e) {
        res.end((JSON.stringify(e)));
    }
})

//API INFO
app.get('/api', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    var str ="";
    str += "req.baseUrl: " + req.baseUrl + "\r\n";
    str += "req.body: " + req.body + "\r\n";
    str += "req.params: " + req.params + "\r\n";
    str += "req.originalUrl: " + req.originalUrl + "\r\n";
    str += "req.path: " + req.path + "\r\n";
    str += "req.protocol: " + req.protocol + "\r\n";
    str += "req.query: " + req.query + "\r\n";
    str += "req.subdomains: " + req.subdomains + "\r\n";
    res.end(str);
})

//Listen
var server = app.listen(1337, function () {
    console.log("http://%s:%s", server.address().address, server.address().port);
})





//var http = require('http');
//var port = process.env.PORT || 1337;

//http.createServer(function (req, res) {
//    res.writeHead(200, { 'Content-Type': 'text/plain' });
//    res.end('Hello World\n');
//}).listen(port);
