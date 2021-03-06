﻿"use strict";

var express = require('express');
var router = express.Router();

var fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");


var taskQueue = require("./apiTaskQueue")
var Task = taskQueue.Task;


//读文件夹
router.get("/readDirSync", function (req, res, next) {
    // 检查路径是否在root内 !!bug
    //if (!checkPathAtRoot(config.storage.root, req.query.path)) {
    //    throw new Error("Access denied: path not in storage root");
    //}
    readDir(config.storage.root + req.query.path, function (files, err) {
        if (err) { return next(err); }
        res.status(200).json({ message: "success", files });
    });
});

router.get("/readDir", function (req, res) {
    var task = new Task(function (resolve, reject) {
        // 检查路径是否在root内
        if (!checkPathAtRoot(config.storage.root, req.query.path)) {
            return reject(new Error("Access denied: path not in storage root"));
        }
        readDir(config.storage.root + req.query.path, function (files, err) {
            if (err) { return reject(err) }
            resolve(files);
        });
    });
    taskQueue.Enqueue(task);
    task.Start();
    res.status(202).json({ message: "success", TaskId: task.TaskId });
});

function checkPathAtRoot(root, target) {
    var arrTarget = path.resolve(root, target).split(path.sep);
    var arrRoot = path.normalize(root).split(path.sep);

    if (arrTarget[0] == "") { arrTarget.splice(0); }
    if (arrRoot[0] == "") { arrRoot.splice(0); }
    if (arrRoot[arrRoot.length - 1] == "") { arrRoot.splice(arrRoot.length - 1); }

    for (var i = 0; i < arrRoot.length; i++) {
        if (arrTarget[i] != arrRoot[i]) {
            return false;
        }
    }
    return true;
}

function readDir(pathToRead, callback) {
    var target = path.normalize(pathToRead);
    fs.readdir(target, (err, files) => {
        if (err) { return callback(null, err) }
        var result = [];
        for (var i = 0; i < files.length; i++) {
            var type;
            try {
                var stats = fs.statSync(path.join(target, files[i]));
                if (stats.isFile()) {
                    type = "File";
                } else if (stats.isDirectory()) {
                    type = "Directory";
                } else if (stats.isBlockDevice()) {
                    type = "BlockDevice";
                } else if (stats.isCharacterDevice()) {
                    type = "CharacterDevice";
                } else if (stats.isSymbolicLink()) {
                    type = "SymbolicLink";
                } else if (stats.isFIFO()) {
                    type = "FIFO";
                } else if (stats.isSocket()) {
                    type = "Socket";
                }
            } catch (err) {
                switch (err.code) {
                    case "EBUSY":
                        type = "Locked";
                        break;
                    case "EPERM":
                        type = "Denied";
                        break;
                    default:
                        return callback(null, err);
                }
            }
            result.push({ name: files[i], type: type });
        }
        callback(result);
    });
}

//重命名 剪切 !!注意耗时操作，需要设计异步api
router.get("/mvSync", function (req, res) {
    fs.rename(req.query.oldPath, req.query.newPath, (err) => {
        if (err) {
            return doErr(err, res);
        }
        res.status(200).json({ message: "success" });
    });
});

router.get("/mv", function (req, res) {
    var task = new Task(function (resolve, reject) {
        fs.rename(req.query.oldPath, req.query.newPath, (err) => {
            if (err) {
                return reject(err);
            }
            resolve("success");
        });
    });
    taskQueue.Enqueue(task);
    task.Start();
    res.status(202).json({ message: "success", TaskId: task.TaskId });
});

//复制 !!注意耗时操作，需要设计异步api
//权限不跟随复制
router.get("/cpSync", function (req, res) {
    var err = copySync(req.query.sourcePath, req.query.targetPath);
    if (err) { return next(err); }
    res.status(200).json({ message: "success" });
});

router.get("/cp", function (req, res) {
    var task = new Task(function (resolve, reject) {
        var err = copySync(req.query.sourcePath, req.query.targetPath);
        if (err) { return reject(err); }
        resolve("success");
    });
    taskQueue.Enqueue(task);
    task.Start();
    res.status(202).json({ message: "success", TaskId: task.TaskId });
});

function copySync(sourcePath, targetPath) {
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
                return "No such file or directory \"" + path.dirname(targetPath) + "\"";
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
                return "cannot overwrite non-directory \"" + path.normalize(targetPath) + "\" with directory \"" + path.normalize(sourcePath) + "\"";
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
                return "No such file or directory \"" + path.dirname(targetPath) + "\"";
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


//删除
router.get("/rmSync", function (req, res) {
    removeSync(req.query.path, req.query.recursive);
    res.status(200).json({ message: "success" });
});

router.get("/rm", function (req, res) {
    var task = new Task(function (resolve, reject) {
        removeSync(req.query.path, req.query.recursive);
        resolve("success");
    });
    taskQueue.Enqueue(task);
    task.Start();
    res.status(202).json({ message: "success", TaskId: task.TaskId });
});

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

//上传
router.get("/newUploadTask", function (req, res) {
    var task = new Task(function (resolve, reject) {
        fs.open(path.join(config.storage.root, req.query.path), 'w+', function (err, fd) {
            if (err) { return reject(err); }
            task.fd = fd;
            task.resolve = resolve;
            task.reject = reject;
            fs.ftruncate(fd, req.query.len, function (err) {
                if (err) { return reject(err); }
                res.status(202).json({ message: "success", TaskId: task.TaskId });
            });
        });

    });
    taskQueue.Enqueue(task);
    task.Start();
});

router.put("/upload", bodyParser.raw({ type: '*/*' }), function (req, res) {
    var task = taskQueue.GetTask(req.query.taskId);
    
    fs.write(task.fd, req.body, req.query.start, req.query.end - req.query.start, function (err, written, buffer) {
        if (err) {
            task.reject(err);
            return next(err);
        }
        task.resolve("success");
    });
    res.status(201).json({ message: "success", TaskId: task.TaskId });
});

exports.Router = router;