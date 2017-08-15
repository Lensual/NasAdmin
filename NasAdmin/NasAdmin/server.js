"use strict";
//include config & log4js
var config = require("./config.json");
var log4js = require("log4js");
log4js.configure(config.log4js);
var logger = log4js.getLogger("default");

//include express & cookie-parser & bodyParse
var express = require("express");
var app = express();

//middleware
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

//include other
var fs = require("fs");
var path = require("path");
//var child_process = require("child_process");

//include module
var apiAuth = require("./apiAuth");
var apiFs = require("./apiFs");
app.use("/api/auth", apiAuth);
app.use("/api/fs", apiFs);


//Listen
//hostname°ó¶¨bug
var server = app.listen(config.port, function () {
    console.log("http://%s:%s", server.address().address, server.address().port);
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



//doErr
function doErr(err, res) {
    logger.error(err);
    res.writeHead(500, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify({ message: err.message, stack: err.stack }));
}
