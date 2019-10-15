'use strict';

const http = require('http');
const fs = require('fs');
const url = require('url');
const mime = require('mime');


//创建并导出 StaticServer类
module.exports = class StaticServer {
    //构造函数
    constructor(options) {
        this.currentServer = null;
        this.options = {
            port: 8080,
            host: '127.0.0.1',
            filePath: './public',
            homePage: '/index.html'
        };

        //自动赋值
        for (let key in options) {
            this.options[key] = options[key];
        }
    }

    //服务器启动函数
    run() {
        let self = this;

        //创建http服务
        this.currentServer = http.createServer((req, res) => {
            let tmpUrl = url.parse(req.url).pathname; //访问地址
            console.log(tmpUrl);
            let reqUrl = tmpUrl === '/' ? self.options.homePage : tmpUrl; //若根路径访问默认页面
            let filePath = self.options.filePath + reqUrl; //文件地址

            //promise 链式调用，每个then()方法都return一个promise对象
            //后面才能跟着调用then()方法或catch()方法
            //文件存在
            self.checkFilePromise(filePath).then(() => {
                //尝试读取文件
                return self.readFilePromise(filePath);
            }).then(data => {
                //读取成功,发送文件数据
                self.sendData(res, data, reqUrl);
            }).catch(() => {
                //统一处理错误
                self.catch404(res);
            });
        }).listen(this.options.port, () => {
            console.log(`listening ${this.options.port}`);
        });
    }

    //关闭服务
    close() {
        this.currentServer.close(() => {
            console.log('Server closed');
        })
    }

    //发送文件内容
    sendData(res, data, url) {
        console.log('mime:' + mime.getType(url.substring(1)))
        res.writeHead(200, { 'Content-Type': mime.getType(url.substring(1)) });
        res.write(data);
        res.end();
    }

    //捕获404
    catch404(res) {
        res.writeHead(404, { 'Content-type': 'text/plain' });
        res.write('Error 404. Resource not found.');
        res.end();
    }

    //使用promise包装读取文件方法
    readFilePromise(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    //promise包装文件是否可读取
    checkFilePromise(path) {
        return new Promise((resolve, reject) => {
            fs.access(path, fs.R_OK, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve('success');
                }
            })
        })
    }



}