"use strict";
//require
var config = require("./config.json");
var log4js = require("log4js");
log4js.configure(config.log4js);
var logger = log4js.getLogger("default");
var express = require("express");
var fs = require("fs");
var app = express();
//var child_process = require("child_process");


//Listen
var server = app.listen(config.port, config.hostname, function () {
    console.log("http://%s:%s", server.address().address, server.address().port);
});

//读文件夹
app.get("/api/readDir", function (req, res) {
    fs.readdir(req.query.path, (err, files) => {
        ifErr(err, res);
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify(files));
    });
});

//重命名 剪切 !!注意耗时操作，需要设计异步api
app.get("/api/rename", function (req, res) {
    fs.rename(req.query.oldPath, req.query.newPath, (err) => {
        ifErr(err, res);
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ message: "success" }));
    });
});

//复制 !!注意耗时操作，需要设计异步api
app.get("/api/cp", function (req, res) {
    fs.stat(req.query.source, (err, stats) => {
        if (stats.isFile) {

        } else if (stats.isDirectory) {

        } else {
            //err
        }
    });







    fs.read(req.query.oldPath, req.query.newPath, (err) => {
        ifErr(err, res);
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ message: "success" }));
    });
});



//API INFO
app.get("/api", function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
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
});

//ifErr
function ifErr(err, res) {
    if (err) {
        logger.error(err);
        res.writeHead(500, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ message: err.message, stack: err.stack }));
        return;
    }
}
