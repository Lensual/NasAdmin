var express = require('express');
var router = express.Router();

var fs = require("fs");


//bodyParser
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

////OAuthServer
//var OAuthServer = require('express-oauth-server');
//var memorystore = require('./oauthModels.js');
//router.oauth = new OAuthServer({
//    model: memorystore,
//    grants: ['password'],
//    debug: true,
//    useErrorHandler: true,
//    continueMiddleware: true,
//    requireClientAuthentication: { password: false }
//});
//const UnauthorizedRequestError = require('oauth2-server/lib/errors/unauthorized-request-error');

const uuidv4 = require('uuid/v4');

//Login
router.post("/login", login);
router.post("/token", login);

function login(req, res) {
    //check parameter
    if (grant_type != "password") {
        global.logger.debug("invalid grant_type: " + getClientIp(req));
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: false, message: "invalid grant_type" }));
    } else if (!username) {
        global.logger.debug("invalid username: " + getClientIp(req));
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: false, message: "invalid username" }));
    } else if (!password) {
        global.logger.debug("invalid password: " + getClientIp(req));
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: false, message: "invalid password" }));
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
        for (var session in sessions) {
            if (session.username == grantuser.username) {
                session.tokens.push(grantuser.token);
            }
        }

        global.logger.info("User login successful: \"" + grant.username + "\"," + getClientIp(req));
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: true, message: "success", token: uuidv4() }));
    } else {
        global.logger.info("User login unsuccessful: \"" + req.body.username + "\"," + getClientIp(req));
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ isSuccess: false, message: "invalid username/password" }));
    }
}

//Logout
router.get("/logout", function (req, res) {
    //delete token
    var sessions = JSON.parse(fs.readFileSync("./sessionStorage.json").toString());
    for (var session in sessions) {
        if (session.username == req.body.username) {
            for (var i = 0; i < tokens.length; i++) {
                if (session.tokens[i] == req.query.token) {
                    session.tokens.splice(i);
                }
            }
        }
    }

    fs.writeFileSync("./sessionStorage.json", JSON.stringify(sessions));

    global.logger.info("User logout successful: \"" + req.body.useusername + "\"," + getClientIp(req));
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
router.use(function (req, res, next) {
    //query token
    var sessions = JSON.parse(fs.readFileSync("./sessionStorage.json").toString());
    for (var session in sessions) {
        if (session.username == req.body.username) {
            for (var token in tokens) {
                if (token == req.query.token) {
                    next();
                }
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
