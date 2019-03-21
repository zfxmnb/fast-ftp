var readline = require('readline');
var path = require('path');
var utils = require('./../utils');
var inputConfig = [{
        key: 'host',
        desc: 'remote IP(required)',
        value: '',
        regExp: /(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))/,
        required: 1,
        msg: 'IP format error'
    },
    {
        key: 'relpath',
        desc: 'remote relative path(required)',
        value: '',
        regExp: /^\/(\w+\/?)*$/,
        required: 1,
        msg: 'path error, right format `/**/**`'
    },
    {
        key: 'username',
        desc: 'connect user(required)',
        value: '',
        regExp: /.+/,
        required: 1,
        msg: 'username is empty'
    },
    {
        key: 'password',
        desc: 'connect password(required)',
        value: '',
        regExp: /.+/,
        required: 1,
        msg: 'password is empty'
    },
    {
        key: 'port',
        desc: 'port number(default：22)',
        defaultValue: '22',
        value: '',
        regExp: /^\d+$/,
        msg: 'port number error'
    },
    {
        key: 'type',
        desc: 'ftp type(default：sftp)',
        defaultValue: 'sftp',
        value: '',
        regExp: /^(sftp|ftp)$/,
        msg: 'ftp type error'
    }
]
//开始
function start() {
    var configsPath = path.join(utils.getCwd(), 'fast-ftp-config.json');
    input({
        config: inputConfig
    }, function (inputConfig) {
        var config = {};
        inputConfig.forEach(function (item) {
            config[item.key] = item.value;
        });
        utils.makeFile(configsPath, utils.jsonFormat(config))
    })
}

//输入
function input(params, callback) {
    params.index = params.index || 0;
    let config = params.config[params.index];
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(config.desc + '  ', function (value) {
        config.value = value || config.defaultValue || '';
        rl.close();
        if (params.index >= params.config.length - 1) {
            callback && callback(params.config);
        } else {
            if (config.regExp) {
                if (config.required) {
                    if (config.value.match(config.regExp)) {
                        params.index++;
                    } else {
                        console.log(config.msg);
                    }
                } else if(config.value && !config.value.match(config.regExp)){
                    console.log(config.msg);
                } else {
                    params.index++;
                }
            } else if (config.required){
                if (config.value) {
                    params.index++;
                } else {
                    console.log(config.msg);
                }
            }else {
                params.index++;
            }
            input(params, callback)
        }
    })
}

module.exports = start;