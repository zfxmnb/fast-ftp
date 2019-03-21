#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var colors = require('colors');
var utils = require('./../utils');
var root = utils.getCwd(); //根目录
var config = utils.getJsonFile(path.join(utils.getCwd(), 'fast-ftp-config.json'), 1) || {} || {}; //配置
//sftp
if (config.type !== "ftp") {
    var sftp = require('ssh2-sftp-client');
    function cftp() {
        this.ftp = new sftp();
        //链接配置
        this.ftpConfig = {
            host: config.host,
            port: config.port || '22',
            username: config.username,
            password: config.password
        }
    }
    //连接
    cftp.prototype.connectRemote = function (callback) {
        console.log("## connect begin ## " + config.relpath);
        this.ftp.connect(this.ftpConfig).then(function () {
            console.log(("## start sftp success ## " + config.relpath).green);
            callback && callback();
        }).catch(function (err) {
            console.log('## connect sftp close ##'.red);
            console.log(err.red || err);
            this.ftp.end();
        }.bind(this));
    }

    //新增修改文件
    cftp.prototype.putFile = function (f, callback) {
        var fileRelPath = f.replace(root, '').replace(/\\/g, '\/');
        this.ftp.put(f, config.relpath + fileRelPath).then(function (data) {
            console.log("## ".green + fileRelPath + " update -> success".green);
            callback();
        }).catch(function (err) {
            console.log("-- ".red + fileRelPath + " update -> fail".red);
            callback();
        });
    }

    //移除文件
    cftp.prototype.removeFile = function (f, callback) {
        var fileRelPath = f.replace(root, '').replace(/\\/g, '\/');
        if (fs.statSync(f).isDirectory()) {
            this.ftp.rmdir(config.relpath + fileRelPath, true).then(function (data) {
                console.log("## ".green + fileRelPath + " rmdir -> success".green);
                callback();
            }).catch(function (err) {
                console.log("-- ".red + fileRelPath + " rmdir -> fail".red);
                callback();
            });
        } else {
            this.ftp.delete(config.relpath + fileRelPath).then(function (data) {
                console.log("## ".green + fileRelPath + " delete -> success".green);
                callback();
            }).catch(function (err) {
                console.log("-- ".red + fileRelPath + " delete -> fail".red);
                callback();
            });
        }
    }

    //新建目录
    cftp.prototype.mkdirFile = function (f, callback) {
        var fileRelPath = f.replace(root, '').replace(/\\/g, '\/');
        this.ftp.mkdir(config.relpath + fileRelPath, false).then(function (data) {
            console.log("## ".green + fileRelPath + " mkdir -> success".green);
            callback();
        }).catch(function (err) {
            callback();
        });
    }
} else {
    //ftp
    var ftp = require('ftp'); // 引入 ftp 模块
    function cftp() {
        this.ftp = new ftp();
        //链接配置
        this.ftpConfig = {
            host: config.host,
            port: parseInt(config.port) || 21,
            user: config.username,
            password: config.password
        }
    }
    //连接
    cftp.prototype.connectRemote = function (callback) {
        console.log("## connect begin ## " + config.relpath);
        this.ftp.connect(this.ftpConfig);
        this.ftp.on('error', function (err) {
            console.log('connect ftp close'.red);
            console.log(err.red || err);
            this.ftp.end();
        }.bind(this));
        this.ftp.on('close', function () {});
        this.ftp.on('end', function () {
            console.log('connect ftp close'.red);
        });
        this.ftp.on('ready', function (err) {
            console.log(("## start ftp success ## " + config.relpath).green);
            callback && callback();
        });
    };

    //新增修改文件
    cftp.prototype.putFile = function (f, callback) {
        var fileRelPath = f.replace(root, '').replace(/\\/g, '\/');
        this.ftp.put(f, config.relpath + fileRelPath, function (err) {
            if (err) {
                console.log("-- ".red + fileRelPath + " update -> fail".red);
            } else {
                console.log("## ".green + fileRelPath + " update -> success".green);
            }
            callback();
        });
    }

    //移除文件
    cftp.prototype.removeFile = function (f, callback) {
        var fileRelPath = f.replace(root, '').replace(/\\/g, '\/');
        if (fs.statSync(f).isDirectory()) {
            this.ftp.rmdir(config.relpath + fileRelPath, true, function (err) {
                if (err) {
                    console.log("-- ".red + fileRelPath + " delete -> fail".red);
                } else {
                    console.log("## ".green + fileRelPath + " delete -> success".green);
                }
                callback();
            });
        } else {
            this.ftp.delete(config.relpath + fileRelPath, function (err) {
                if (err) {
                    console.log("-- ".red + fileRelPath + " delete -> fail".red);
                } else {
                    console.log("## ".green + fileRelPath + " delete -> success".green);
                }
                callback();
            });
        }
    }

    //新建目录
    cftp.prototype.mkdirFile = function (f, callback) {
        var fileRelPath = f.replace(root, '').replace(/\\/g, '\/');
        this.ftp.mkdir(config.relpath + fileRelPath, false, function (err) {
            if (err) {} else {
                console.log("## ".green + fileRelPath + " mkdir -> success".green);
            }
            callback();
        });
    }
};

/**
 * 往上尝试新建目录，防止父级目录不存在
 * @param {*} client
 * @param {*} filePath 
 */
function makeRemoteDir(client, filePath, callback) {
    var files = [];
    while(path.dirname(filePath) != root){
        filePath = path.dirname(filePath);
        files.unshift(filePath);
    }
    files.unshift(filePath);
    mkdir(files);
    function mkdir(files){
        if(files.length){
            client.mkdirFile(files.shift(), function(){
                mkdir(files)
            })
        }else{
            callback && callback();
        }
    }
}

/**
 * 遍历上传文件
 * @param {*} client ftp 实例
 * @param {*} dirPath 目录
 * @param {*} callback 回调
 */
function upload(client, dirPath, callback) {
    if (fs.statSync(dirPath).isDirectory()) {
        client.mkdirFile(dirPath, function () {
            var files = fs.readdirSync(dirPath);
            if (files.length) {
                var pass = 0;
                files.forEach(function (file) {
                    upload(client, dirPath + "\\" + file, function () {
                        pass++;
                        if (pass == files.length) {
                            callback && callback();
                        }
                    })
                })
            } else {
                callback && callback();
            }
        });
    } else {
        client.putFile(dirPath, function () {
            callback && callback();
        })
    }
}

/**
 * 开始上传
 * @param {*} filePath 绝对路径
 * @param {*} relpath 远程服务器路径
 * @param {*} force 上传时是否强制删除
 */
function start(filePath, relpath, force, callback) {
    config.relpath = relpath || config.relpath;
    if (filePath != root && config.host && config.username && config.password && config.relpath) {
        var client = new cftp();
        client.connectRemote(function () {
            if(fs.existsSync(filePath)){
                makeRemoteDir(client, filePath, function () {
                    if (force) {
                        client.removeFile(filePath, function () {
                            upload(client, filePath, function () {
                                console.log("## upload  complated ##".green);
                                client.ftp.end && client.ftp.end();
                                callback && callback();
                            });
                        })
                    } else {
                        upload(client, filePath, function () {
                            console.log("## upload  complated ##".green);
                            client.ftp.end && client.ftp.end();
                            callback && callback();
                        });
                    }
                })
            }else{
                console.log("## file is not exists ##".red);
                client.ftp.end && client.ftp.end();
            }
        });
    } else {
        console.log("configuration use `npm run ff-config`".red);
    }
}

module.exports = start