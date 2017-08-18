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

//Logout

//Auth
route.use(function (req, res, next) {
    if () {

    }
});

module.exports = router;