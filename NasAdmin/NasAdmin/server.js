"use strict";
//require
var config = require("./config.json");
var log4js = require("log4js");
log4js.configure(config.log4js);
var logger = log4js.getLogger("default");
var express = require("express");
var fs = require("fs");
var app = express();
var path = require("path");
//var child_process = require("child_process");


//Listen
//hostname绑定bug
var server = app.listen(config.port, function () {
    console.log("http://%s:%s", server.address().address, server.address().port);
});

//读文件夹
app.get("/api/readDirSync", function (req, res) {
    fs.readdir(req.query.path, (err, files) => {
        if (err) {
            doErr(err, res);
            return;
        }
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify(files));
    });
});

//重命名 剪切 !!注意耗时操作，需要设计异步api
app.get("/api/mvSync", function (req, res) {
    fs.rename(req.query.oldPath, req.query.newPath, (err) => {
        if (err) {
            doErr(err, res);
            return;
        }
        res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
        res.end(JSON.stringify({ message: "success" }));
    });
});

//复制 !!注意耗时操作，需要设计异步api
//权限不跟随复制
app.get("/api/cpSync", function (req, res) {
    function copySync(sourcePath, targetPath) { //有错误直接抛异常
        var s_stats = fs.statSync(sourcePath);

        if (s_stats.isFile()) {
            //!!缺个判断目标
            //判断目标是否存在
            if (fs.existsSync(targetPath)) {
                //判断目标是不是目录
                var t_stats = fs.statSync(targetPath);
                if (t_stats.isDirectory()) {
                    //retarget到新建文件
                    var retarget = path.join(targetPath, path.basename(sourcePath));
                }
            } else {
                //判断目标所在目录是否存在
                if (!fs.existsSync(path.dirname(targetPath))) {
                    throw new Error("No such file or directory \"" + path.dirname(targetPath) + "\"");
                }
            }
            var rs = fs.createReadStream(sourcePath);
            if (retarget == null) {
                var ws = fs.createWriteStream(targetPath);
            } else {
                var ws = fs.createWriteStream(retarget);
            }
            rs.pipe(ws);
            rs.close();
            ws.close();
            //!!加个优化
        } else {
            //判断目标是否存在
            if (fs.existsSync(targetPath)) {
                //判断目标是不是目录
                var t_stats = fs.statSync(targetPath);
                if (t_stats.isFile()) {
                    throw new Error("cannot overwrite non-directory \"" + path.normalize(targetPath) + "\" with directory \"" + path.normalize(sourcePath) + "\"");
                }
                //判断目标目录是否存在同名目录
                if (!fs.existsSync(path.join(targetPath, path.basename(sourcePath)))) {
                    fs.mkdirSync(path.join(targetPath, path.basename(sourcePath)));
                }
            } else {
                //判断目标所在目录是否存在
                if (fs.existsSync(path.dirname(targetPath))) {
                    fs.mkdirSync(targetPath);
                    var renameFlag = true;
                } else {
                    throw new Error("No such file or directory \"" + path.dirname(targetPath) + "\"");
                }
            }
            //如果目标被重命名
            if (renameFlag) {
                var retarget = targetPath;
            } else {
                var retarget = path.join(targetPath, path.basename(sourcePath));
            }
            //遍历源递归
            var s_files = fs.readdirSync(sourcePath);
            s_files.forEach(function (file) {
                copySync(path.join(sourcePath, file), retarget);
            });
        }

    }

    copySync(req.query.sourcePath, req.query.targetPath);
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify({ message: "success" }));
});

//删除
app.get("/api/rmSync", function (req, res) {
    function removeSync(sourcePath, recursive) {
        if (!fs.existsSync(sourcePath)) {
            logger.warn("No such file or directory \"" + path.normalize(sourcePath) + "\"");
            return;
        }
        if (fs.statSync(sourcePath).isDirectory()) {
            if (!recursive) {
                fs.rmdirSync(sourcePath);
            } else {
                var files = fs.readdirSync(sourcePath);
                files.forEach(function (file) {
                    removeSync(path.join(sourcePath, file), true);
                });
                fs.rmdirSync(sourcePath);
            }
        } else {
            fs.unlinkSync(sourcePath);
        }
    }

    removeSync(req.query.path, req.query.recursive);
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify({ message: "success" }));
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
