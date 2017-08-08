'use strict';
var express = require('express');
var app = express();
var fs = require("fs");

app.get('/api', function (req, res) {
    fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
        console.log(data);
        res.end(data);
    });
})

var server = app.listen(1337, function () {
    console.log("应用实例，访问地址为 http://%s:%s", server.address().address, server.address().port);
})





//var http = require('http');
//var port = process.env.PORT || 1337;

//http.createServer(function (req, res) {
//    res.writeHead(200, { 'Content-Type': 'text/plain' });
//    res.end('Hello World\n');
//}).listen(port);
