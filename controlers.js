const fs = require('fs')

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

module.exports = {
    index(req, res, next) {
        let options = {
            root: __dirname + '/public/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile('index.html', options, (err) => {
            err && next(err)
            next()
        })
    }
}