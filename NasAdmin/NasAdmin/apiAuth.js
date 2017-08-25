var express = require('express');
var router = express.Router();

var fs = require("fs");

//bodyParser
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

//OAuthServer
var OAuthServer = require('express-oauth-server');
var memorystore = require('./oauthModels.js');
router.oauth = new OAuthServer({
    model: memorystore,
    grants: ['password'],
    //debug: true,
    useErrorHandler: false, 
    continueMiddleware: false,
});

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
        //req.session.user = grant;
        //global.logger.info("User login successful: \"" + req.session.user.name + "\"," + getClientIp(req));
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        //res.end(JSON.stringify({ isSuccess: true, message: "success", sessionId: req.sessionID}));
    } else {
        global.logger.info("User login unsuccessful: \"" + req.body.user + "\"," + getClientIp(req));
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: false, message: "invalid username/password" }));
    }
});

//Logout
router.get("/logout", function (req, res) {
    //req.session.unset = 'destroy';
    //global.logger.info("User logout successful: \"" + req.session.user.name + "\"," + getClientIp(req));
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify({ isSuccess: true, message: "success" }));
})

////sessionInfo
//router.get("/sessionInfo", function (req, res) {
//    global.logger.debug(JSON.stringify(req.session));
//    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
//    res.end(JSON.stringify(req.session));
//})

//Authenticate
//router.use(function (req, res, next) {
//    if (req.session.user) {
//        next();
//    } else {
//        global.logger.info("Access denied, not login: " + getClientIp(req) + "\"");
//        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
//        res.end(JSON.stringify({ isSuccess: false, message: "Access denied, not login" }));
//    }
//});
router.use(function (req,res,next) {
    if (true) {

    }
    router.oauth.authenticate()(req,res,next);
});

router.get("/oauth", function (req, res, next) {

});

//Permission
router.get("/permission", function (req,res) {
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify(
        {
            isSuccess: true,
            message: "success",
            data: [
                {
                    name: "filesystem",
                    displayName: "File System"
                },
                {
                    name: "setting",
                    displayName: "Setting"
                }
            ]
        }));
})

module.exports = router;

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};