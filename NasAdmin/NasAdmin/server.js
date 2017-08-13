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
//hostname��bug
var server = app.listen(config.port, function () {
    console.log("http://%s:%s", server.address().address, server.address().port);
});

//���ļ���
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

//������ ���� !!ע���ʱ��������Ҫ����첽api
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

//���� !!ע���ʱ��������Ҫ����첽api
//Ȩ�޲����渴��
app.get("/api/cpSync", function (req, res) {
    function copySync(sourcePath, targetPath) { //�д���ֱ�����쳣
        var s_stats = fs.statSync(sourcePath);

        if (s_stats.isFile()) {
            //!!ȱ���ж�Ŀ��
            //�ж�Ŀ���Ƿ����
            if (fs.existsSync(targetPath)) {
                //�ж�Ŀ���ǲ���Ŀ¼
                var t_stats = fs.statSync(targetPath);
                if (t_stats.isDirectory()) {
                    //retarget���½��ļ�
                    var retarget = path.join(targetPath, path.basename(sourcePath));
                }
            } else {
                //�ж�Ŀ������Ŀ¼�Ƿ����
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
            //!!�Ӹ��Ż�
        } else {
            //�ж�Ŀ���Ƿ����
            if (fs.existsSync(targetPath)) {
                //�ж�Ŀ���ǲ���Ŀ¼
                var t_stats = fs.statSync(targetPath);
                if (t_stats.isFile()) {
                    throw new Error("cannot overwrite non-directory \"" + path.normalize(targetPath) + "\" with directory \"" + path.normalize(sourcePath) + "\"");
                }
                //�ж�Ŀ��Ŀ¼�Ƿ����ͬ��Ŀ¼
                if (!fs.existsSync(path.join(targetPath, path.basename(sourcePath)))) {
                    fs.mkdirSync(path.join(targetPath, path.basename(sourcePath)));
                }
            } else {
                //�ж�Ŀ������Ŀ¼�Ƿ����
                if (fs.existsSync(path.dirname(targetPath))) {
                    fs.mkdirSync(targetPath);
                    var renameFlag = true;
                } else {
                    throw new Error("No such file or directory \"" + path.dirname(targetPath) + "\"");
                }
            }
            //���Ŀ�걻������
            if (renameFlag) {
                var retarget = targetPath;
            } else {
                var retarget = path.join(targetPath, path.basename(sourcePath));
            }
            //����Դ�ݹ�
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

//ɾ��
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
