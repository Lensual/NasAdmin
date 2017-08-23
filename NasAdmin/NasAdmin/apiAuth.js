var express = require('express');
var router = express.Router();

var fs = require("fs");

//middleware
var session = require("express-session");
router.use(session({
    secret: 'recommand 128 bytes random string', // !!自定义
    cookie: { maxAge: 60 * 1000 * 5 } //!! 自定义超时时间
}));
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

//Login
router.post("/login", function (req, res) {
    var users = JSON.parse(fs.readFileSync("./users.json").toString());
    var grant;
    users.forEach(function (user) {
        if (req.body.user == user.name && req.body.pwd == user.pwd) {
            grant = user;
        }
    });
    if (grant != null) {
        req.session.user = grant;
        global.logger.info("User login successful: \"" + req.session.user.name + "\"," + getClientIp(req));
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: true, message: "success" }));
    } else {
        global.logger.info("User login unsuccessful: \"" + req.body.user + "\"," + getClientIp(req));
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: false, message: "invalid username/password" }));
    }
});

//Logout
router.get("/logout", function (req, res) {
    req.session.unset = 'destroy';
    global.logger.info("User logout successful: \"" + req.session.user.name + "\"," + getClientIp(req));
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify({ isSuccess: true, message: "success" }));
})

//sessionInfo
router.get("/sessionInfo", function (req, res) {
    global.logger.debug(JSON.stringify(req.session));
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify(req.session));
})

//Auth
router.use(function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        global.logger.info("Access denied, not login: " + getClientIp(req) + "\"");
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: flse, message: "Access denied, not login" }));
    }
});

module.exports = router;

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};