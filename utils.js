var process = require('process');
var fs = require('fs');
var path = require('path');
var jsonFormat = require('json-format');
var cwd = process.cwd();
//获取执行路径
function getCwd() {
    return cwd;
}
//获取环境变量
function getArgs(){
    var argvs = [];
    for (var i = 2; i < process.argv.length; i++) {
        argvs.push(process.argv[i])
    }
    return argvs
}

//安全获取json文件
function getJsonFile(file_url, safe) {
    var json;
    if(fs.existsSync(file_url)){
        if (safe) {
            var jsonStr = fs.readFileSync(file_url, 'utf-8');
            try {
                json = JSON.parse(jsonStr);
            } catch (err) {}
        } else {
            json = require(file_url);
        }
    }
    return json
}

//拷贝文件
function copyFile(src, dst, ignores) {
    if(!fs.existsSync(src)){
        return
    }
    var stat = fs.statSync(src);
    if(stat.isDirectory()){
        !fs.existsSync(dst) &&  fs.mkdirSync(dst);
        var paths = fs.readdirSync(src);
        if (paths.length) {
            paths.forEach(function (file) {
                if(!(ignores && ignores.include(file))){
                    var childSrc = path.join(src, file);
                    var childDst = path.join(dst, file);
                    copyDir(childSrc, childDst);
                }
            });
        }
    }else{
        fs.writeFileSync(dst, fs.readFileSync(src));
    }
}

//移除文件
function removeFile(dst) {
    var paths = fs.readdirSync(dst);
    paths.forEach(function (file) {
        var _dst = path.join(dst, file); //拼接子文件路径
        var _stat = fs.statSync(_dst)
        if (_stat.isFile()) {
            fs.unlinkSync(_dst); //若为文件则删除
        } else if (_stat.isDirectory()) {
            removeFile(_dst)
        }
    })
    try {
        fs.rmdirSync(dst);
    } catch (err) {}
}

//创建文件文件夹
function makeFile(filePath, txt) {
    var files = [];
    while(!filePath.match(/^\w\:$|^\/$/)){
        files.unshift(filePath);
        filePath = filePath.replace(/[\/|\\][^\/|\\]*$/,'');
    }

    files.forEach(function(file, index){
        if(index >= files.length - 1){
            if(typeof txt === 'string' && path.extname(file)){
                fs.writeFileSync(file, txt);
            }else if(!fs.existsSync(file)){
                fs.mkdirSync(file);
            }
        }else if(!fs.existsSync(file)){
            fs.mkdirSync(file);
        }
    })
}


module.exports = {
    getCwd: getCwd,
    getArgs: getArgs,
    getJsonFile: getJsonFile,
    copyFile: copyFile,
    removeFile: removeFile,
    makeFile: makeFile,
    jsonFormat: jsonFormat
}