'use strict';
var express = require('express');
var app = express();
var fs = require("fs");

app.get('/api/readdir/*', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    try {
        req.path
        res.end(fs.readdirSync(req.path));

    } catch (e) {
        res.end(String(e));
    }

    //fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
    //    console.log(data);
    //    res.end(data);
    //});
})

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

var server = app.listen(1337, function () {
    console.log("http://%s:%s", server.address().address, server.address().port);
})





//var http = require('http');
//var port = process.env.PORT || 1337;

//http.createServer(function (req, res) {
//    res.writeHead(200, { 'Content-Type': 'text/plain' });
//    res.end('Hello World\n');
//}).listen(port);
