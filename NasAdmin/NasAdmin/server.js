"use strict";
//include config & log4js
var config = require("./config.json");
var log4js = require("log4js");
log4js.configure(config.log4js);
global.logger = log4js.getLogger("default");

//include express & bodyParse
var express = require("express");
var app = express();

//Cross Domin
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

//include module
//!!需要实现动态
var apiAuth = require("./apiAuth");
var apiFs = require("./apiFs");
app.use("/api/auth", apiAuth);
app.use("/api/fs", apiFs);

//API INFO
app.get("/api", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end();  //!!待填坑
});

//404
app.use(function (req,res) {
    logger.debug('404 "' + req.originalUrl + '"');
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ message: "404 Not Found", path: req.originalUrl });
});

//errorHandler
app.use(function (err, req, res, next) {
    if (err) {
        logger.error(err);
        if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json');
            res.status(500).json({ message: err.message, stack: err.stack });
        }
    }
});

//Listen
//!!hostname绑定bug
var server = app.listen(config.port, function () {
    console.log("http://%s:%s", server.address().address, server.address().port);
});