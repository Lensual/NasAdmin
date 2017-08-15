var express = require('express');
var router = express.Router();

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

module.exports = router;