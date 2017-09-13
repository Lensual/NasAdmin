"use strict";

var express = require('express');
var router = express.Router();

//uuidv4
const uuidv4 = require('uuid/v4');

var tasks = [];

function Enqueue(task) {
    //!!待实现 检查task
    tasks.push(task);
    return task;
}

function Task(args, func) {
    this.TaskId = uuidv4();
    this.Status = "init";
    this.Func = func;   //被调用函数
    this.Args = args;   //传入参数
    var self = this;
    this.Start = function () {
        self.Promise = new Promise(function (resolve, reject) {
            self.Status = "pending";
            try {
                resolve(self.Func(self));
            } catch (err) {
                reject(err);
            }
        })
            .then(function (value) {
                self.Result = value;
                self.Status = "fulfilled";
                //console.log(self);
                self.Check();
                //console.log(self);
            })
            .catch(function (reason) {
                self.Result = reason;
                self.Status = "rejected";
            });
    };
    this.IsChecked = false;
    this.Check = function () {
        if (self.Status == "fulfilled" || self.Status == "rejected") {
            self.IsChecked = true;
            return self.Status;
        } else {
            return self.Status;
        }
    };
}

function GetTask(taskId) {
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].TaskId == taskId) {
            return tasks[i];
        }
    }
}

function Clean() {
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].IsChecked) {
            tasks.splice(i);
            i--;
        }
    }
}

function Save() {

}

router.get("/check/:taskId", function (req, res) {
    //console.log(GetTask(req.params.taskId));
    var task = GetTask(req.params.taskId);
    if (task) {
        res.status(200).json({ message: "success", Status: task.Check(), TaskId: task.TaskId, Result: task.Result });
    } else {
        res.status(404).json({ message: "taskId not found" });
    }
});

exports.Router = router;
exports.Enqueue = Enqueue;
exports.Task = Task;
exports.GetTask = GetTask;
exports.Clean = Clean;
exports.Save = Save;