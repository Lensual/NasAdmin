'use strict';
var config = require("./config.json");
var log4js = require("log4js");
log4js.configure(config.log4js);
var logger = log4js.getLogger("default")
var express = require('express');
var fs = require("fs");
var app = express();


//Listen
var server = app.listen(config.port,config.hostname, function () {
    console.log("http://%s:%s", server.address().address, server.address().port);
})

//¶ÁÎÄ¼þ¼Ð
app.get('/api/readDir', function (req, res) {
    try {
        var str = JSON.stringify(fs.readdirSync(req.query.path));
        res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
        res.end(str);
    } catch (e) {
        logger.error(e);
        res.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
        res.end((JSON.stringify({ code: e.code, message: e.message, stack: e.stack })));
    }
})

//API INFO
app.get('/api', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    var str = "";
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
