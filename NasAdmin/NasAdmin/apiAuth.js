"use strict";
//express
var express = require('express');
var router = express.Router();
//fs
var fs = require("fs");

//bodyParser
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

//uuidv4
const uuidv4 = require('uuid/v4');

//Login
router.post("/login", login);
router.post("/token", login);

function login(req, res) {
    //check parameter
    if (req.body.grant_type != "password") {
        global.logger.debug("invalid grant_type: " + getClientIp(req));
        res.status(400).json({ message: "invalid grant_type" });
    } else if (!req.body.username) {
        global.logger.debug("invalid username: " + getClientIp(req));
        res.status(400).json({ message: "invalid username" });
    } else if (!req.body.password) {
        global.logger.debug("invalid password: " + getClientIp(req));
        res.status(400).json({ message: "invalid password" });
    }
    //query users
    var users = JSON.parse(fs.readFileSync("./users.json").toString());
    var grantuser;
    users.forEach(function (user) {
        if (req.body.username == user.username && req.body.password == user.password) {
            grantuser = user;
        }
    });
    if (grantuser != null) {
        //generate token
        grantuser.token = uuidv4();
        var sessions = JSON.parse(fs.readFileSync("./sessionStorage.json").toString());
        for (var i = 0; i < sessions.length; i++) {
            if (sessions[i].username == grantuser.username) {
                sessions[i].tokens.push(grantuser.token);
            }
        }

        fs.writeFileSync("./sessionStorage.json", JSON.stringify(sessions, null, 2));

        global.logger.info("User login successful: \"" + grantuser.username + "\"," + getClientIp(req));
        res.status(200).json({ message: "success", token: grantuser.token });
    } else {
        //login unsucessful
        global.logger.info("User login unsuccessful: \"" + req.body.username + "\"," + getClientIp(req));
        res.status(401).json({ message: "invalid username/password" });
    }
}

//Logout
router.get("/logout", function (req, res) {
    //delete token
    var sessions = JSON.parse(fs.readFileSync("./sessionStorage.json").toString());
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i] == req.body.username) {
            for (var j = 0; j < sessions[i].tokens.length; j++) {
                if (sessions[i].tokens[j] == req.header("token")) {
                    sessions[i].tokens.splice(j);
                    j--;
                }
            }
        }
    }

    fs.writeFileSync("./sessionStorage.json", sessions, null, 2);

    global.logger.info("User logout successful: \"" + req.body.useusername + "\"," + getClientIp(req));
    res.status(200).json({ message: "success" });
})

//sessionInfo
router.get("/sessionInfo", function (req, res) {
    if (req.header("token")) { //!!待验证是否存在bug
        var sessions = JSON.parse(fs.readFileSync("./sessionStorage.json").toString())
        for (var i = 0; i < sessions.length; i++) {
            for (var j = 0; j < sessions[i].tokens.length; j++) {
                if (sessions[i].tokens[j] == req.header("token")) {
                    res.status(200).json({ message: "success", session: sessions[i] });
                    return;
                }
            }
        }
        res.status(401).json({ message: "not login" });
    } else {
        res.status(401).json({ message: "invalid token" });
    }
})

//Authenticate
router.use(function (req, res, next) {
    //query token
    var sessions = JSON.parse(fs.readFileSync("./sessionStorage.json").toString());
    for (var i in sessions) {
        for (var j in sessions[i].tokens) {
            if (sessions[i].tokens[j] == req.header("token")) {
                next();
                return;
            }
        }
    }
    if (global.config.debug && global.config.debug.nologin) {
        next();
        return;
    }
    global.logger.info("Access denied, not login: " + getClientIp(req) + "\"");
    res.status(403).json({ message: "Access denied, not login" });
});

//Permission !!功能未完成
router.get("/permission", function (req, res) {
    res.status(200).json(
        {
            message: "success",
            grant: [
                {
                    name: "filesystem",
                    priority: "0"
                },
                {
                    name: "setting",
                    priority: "100"
                }
            ]
        });
});

exports.Router = router;

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};
