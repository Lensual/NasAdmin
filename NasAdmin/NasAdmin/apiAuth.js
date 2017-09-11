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
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ message: "invalid grant_type" });
    } else if (!req.body.username) {
        global.logger.debug("invalid username: " + getClientIp(req));
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ message: "invalid username" });
    } else if (!req.body.password) {
        global.logger.debug("invalid password: " + getClientIp(req));
        res.setHeader('Content-Type', 'application/json');
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
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(JSON.stringify({ token: grantuser.token }));
    } else {
        //login unsucessful
        global.logger.info("User login unsuccessful: \"" + req.body.username + "\"," + getClientIp(req));
        res.setHeader('Content-Type', 'application/json');
        res.status(401).json(JSON.stringify({ message: "invalid username/password" }));
    }
}

//Logout
router.get("/logout", function (req, res) {
    //delete token
    var sessions = JSON.parse(fs.readFileSync("./sessionStorage.json").toString());
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i] == req.body.username) {
            for (var j = 0; j < sessions[i].tokens.length; j++) {
                if (sessions[i].tokens[j] == req.query.token) {
                    sessions[i].tokens.splice(j);
                }
            }
        }
    }

    fs.writeFileSync("./sessionStorage.json", JSON.stringify(sessions, null, 2));

    global.logger.info("User logout successful: \"" + req.body.useusername + "\"," + getClientIp(req));
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end();
})

//sessionInfo
router.get("/sessionInfo", function (req, res) {
    if (req.query.token) {
        var sessions = JSON.parse(fs.readFileSync("./sessionStorage.json").toString())
        for (var i = 0; i < sessions.length; i++) {
            for (var j = 0; j < sessions[i].tokens.length; j++) {
                if (sessions[i].tokens[j] == req.query.token) {
                    res.setHeader('Content-Type', 'application/json');

                    res.end(JSON.stringify({ isSuccess: true, data: sessions[i] }));
                    return;
                }
            }
        }
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: false, message: "not login" }));
    } else {
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: false, message: "invalid token" }));
    }
})



//Authenticate
router.use(function (req, res, next) {
    //query token
    var sessions = JSON.parse(fs.readFileSync("./sessionStorage.json").toString());
    for (var i in sessions) {
        for (var j in sessions[i].tokens) {
            if (sessions[i].tokens[j] == req.query.token) {
                next();
                return;
            }
        }
    }
    global.logger.info("Access denied, not login: " + getClientIp(req) + "\"");
    res.end(JSON.stringify({ isSuccess: false, message: "Access denied, not login" }))
});


//Permission
router.get("/permission", function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify(
        {
            isSuccess: true,
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
        }, null, 2));
})

module.exports = router;

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};
