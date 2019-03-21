# fast-ftp 
## config
```js
    npm run ff-config
    //或
    import {config} from 'fast-ftp'
    config();
```
## post
```js
    npm run ff-post [localPath] [remotePath] [-f] //localPath本地相对执行路径的相对路径 remotePath本地执行路径的远程相对路径 -f强制删除覆盖
    //或
    import {post} from 'fast-ftp'
    /**
     * 开始上传
     * @param {*} filePath 绝对路径
     * @param {*} relpath 远程服务器路径
     * @param {*} force 上传时是否强制删除远程
     * @param {*} callback 回调
     */
    post(filePath, relpath, force, callback)
```