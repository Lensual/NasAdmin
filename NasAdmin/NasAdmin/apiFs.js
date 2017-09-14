﻿"use strict";

var express = require('express');
var router = express.Router();

var fs = require("fs");
var path = require("path");

var taskQueue = require("./apiTaskQueue")
var Task = taskQueue.Task;


//读文件夹
router.get("/readDirSync", function (req, res, next) {
    fs.readdir(req.query.path, (err, files) => {
        if (err) { next(err) };
        res.status(200).json({ message: "success", files });
    });
});

router.get("/readDir", function (req, res) {
    var task = new Task(function (resolve, reject) {
        fs.readdir(req.query.path, (err, files) => {
            if (err) { reject(err) }
            resolve(files);
        });
    });
    taskQueue.Enqueue(task);
    task.Start();
    res.status(202).json({ message: "success", TaskId: task.TaskId });
});

//重命名 剪切 !!注意耗时操作，需要设计异步api
router.get("/mvSync", function (req, res) {
    fs.rename(req.query.oldPath, req.query.newPath, (err) => {
        if (err) {
            doErr(err, res);
            return;
        }
        res.status(200).json({ message: "success" });
    });
});

//复制 !!注意耗时操作，需要设计异步api
//权限不跟随复制
router.get("/cpSync", function (req, res) {
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

    try {
        copySync(req.query.sourcePath, req.query.targetPath);
    } catch (err) {
        next(err);
        return;
    }

    res.status(200).json({ message: "success" });
});

//删除
router.get("/rmSync", function (req, res) {
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

    try {
        removeSync(req.query.path, req.query.recursive);
    } catch (err) {
        next(err);
        return;
    }

    res.status(200).json({ message: "success" });
});

exports.Router = router;