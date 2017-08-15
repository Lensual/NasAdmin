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
var apiFs = require("./apiFs");
var apiAuth = require("./apiAuth");


//Listen
//hostname°ó¶¨bug
var server = app.listen(config.port, function () {
    console.log("http://%s:%s", server.address().address, server.address().port);
});

app.use("/api/auth", apiAuth);
app.use("/api/fs", apiFs);

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

//Login
app.post("/api/login", function (req, res) {
    var users = JSON.parse(fs.readFileSync("./users.json").toString());
    var grant = null;
    users.forEach(function (user) {
        if (req.body.user == user.name && req.body.pwd == user.pwd) {
            grant = user;
        }
    });
    if (grant != null) {
        logger.info("User login successful: \"" + grant.name + "\"");
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ message: "success" }));
    } else {
        logger.info("User login unsuccessful: \"" + req.body.user + "\"");
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ message: "invalid username/password" }));
    }
});

//doErr
function doErr(err, res) {
    logger.error(err);
    res.writeHead(500, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify({ message: err.message, stack: err.stack }));
}
