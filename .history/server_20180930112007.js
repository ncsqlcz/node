const express = require('express')
const spdy = require('spdy')
const logger = require('morgan')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
const controlers = require('./controlers')

// 设置根路径
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/files'));
app.use(express.static(__dirname + '/uploads'));
app.use(logger('dev'))

// 服务器监听端口号
const port = 8090
// 证书路径
const options = {
    key: fs.readFileSync(__dirname + '/server.key'),
    cert: fs.readFileSync(__dirname + '/server.crt')
}

spdy.createServer(options, app).listen(port, (err) => {
    if (err) {
        console.error(err)
    } else {
        console.log('Listening on port: ' + port + '.')
    }
})

// app.listen(port, () => {
//     console.log('server listening at: ' + port)
// });

// （权限）路由系统
// 日志系统
// websocket
// 消息队列
// 多线程
// 后端模板（SEO）
// 热部署
// models
// 爬虫
// https
// 


app.use('/', controlers.index)

module.exports = app

// const path = 'server1.js'
const getFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            err && reject(err)
            // 创建和这个文件一样大小的缓冲区
            let buf = Buffer.alloc(stat.size)
            fs.open(path, 'r', (err, fd) => {
                err && reject(err)
                fs.read(fd, buf, 0, buf.length, 0, (err, bytes) => {
                    err && reject(err)
                    if (bytes > 0) {
                        resolve(buf.slice(0, bytes).toString())
                    }
                    fs.close(fd, (err) => {
                        err && reject(err)
                        // console.log('文件关闭成功')
                    })
                })
            })
        })
    })
}