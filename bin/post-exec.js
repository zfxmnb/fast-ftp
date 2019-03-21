#!/usr/bin/env node

var path = require('path');
var colors = require('colors');
var utils = require('./../utils');
var post = require('./post');
var root = utils.getCwd(); //根目录
var argv = utils.getArgs(); //环境变量
//本地监听路径
if(argv[0] && argv[0].match(/^\.?\/?[^\/]+/)){
    var relpath = argv[1] && argv[1].match(/^(\w+\/?)*$/) && ('/' + argv[1].replace(/\\/g,'/')); //相对路径
    var filePath = path.join(root, argv[0] || ''); //绝对路径
    var force = argv.indexOf('-f') > -1; //上传时是否强制删除
    if(!argv[1] || relpath || force === 1){
        post(filePath, relpath, force);
    }else{
        console.log('argv1 relpath error');
    }
}else{
    console.log('please input right filepath');
}
