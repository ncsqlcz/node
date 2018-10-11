const path = require('path')
const Koa = require('koa')
const compress = require('koa-compress') // gzip
const routers = require('koa-router')()
const convert = require('koa-convert')
const koaLogger = require('koa-logger')
const spdy = require('spdy')
const fs = require('fs')
const views = require('koa-views')
const koaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors') // 跨域
const staticCache = require('koa-static-cache') // 静态缓存
const routerCache = require('koa-router-cache') // 路由缓存

// const session = require('koa-session-minimal')
// const MysqlStore = require('koa-mysql-session')
const controlers = require('./controlers')
// const config = require('./../config')

var MemoryCache = routerCache.MemoryCache


routers.get('/mes', async ctx => {
  ctx.body = fs.createReadStream(__dirname + '/public/index.html')
})

// 服务器监听端口号
const port = 8090
// 证书路径
const options = {
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.crt')
}

class KoaOnHttps extends Koa {
  constructor() {
    super()
  }
  // 重写listen方法
  listen() {
    const server = spdy.createServer(options, this.callback())
    return server.listen.apply(server, arguments)
  }
}
const app = new KoaOnHttps()

// 设置缓存 必须在使用路由之前
app.use(
  staticCache(path.join(__dirname, './public'), {
    maxAge: 7 * 24 * 60 * 60 // 缓存一周
  })
)

// 路由缓存
app.use(convert(routerCache(app, {
  'GET /': {
    key: 'cache:index',
    expire: 5 * 1000,
    get: MemoryCache.get,
    set: MemoryCache.set,
    passthrough: MemoryCache.passthrough,
    evtName: 'clearIndexCache',
    destroy: MemoryCache.destroy
  }
})));

let count = 0
app.use(async function (ctx, next) {
  await next()
  if (ctx.path === '/mes') {
    // ctx.body = count++;
    if (count === 5) {
      count = 0;
      ctx.app.emit('clearIndexCache');
    }
  }
});

// gzip压缩选项
const compressOptions = {
  threshold: 2048
}
app.use(compress(compressOptions))
// 配置控制台日志中间件
app.use(convert(koaLogger()))
// 配置ctx.body解析中间件
app.use(bodyParser())
// 配置静态资源目录
app.use(convert(koaStatic(path.join(__dirname, './public'))))
// 配置服务端模板渲染引擎中间件
app.use(
  views(path.join(__dirname, './views'), {
    extension: 'ejs'
  })
)
// 初始化路由中间件
app.use(routers.routes()).use(routers.allowedMethods())

// x-response-time
app.use(async function (ctx, next) {
  const start = new Date()
  await next()
  const ms = new Date() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})
// logger
app.use(async function (ctx, next) {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})
// 启动服务器
app.listen(port, () => {
  console.log('Listening on port: ' + port + '.')
})

// spdy.createServer(options, app.callback()).listen(port, (err) => {
//     if (err) {
//         console.error(err)
//     } else {
//         console.log('Listening on port: ' + port + '.')
//     }
// })

// （权限）路由系统
// 日志系统
// websocket
// 消息队列
// 多线程
// 后端模板（SEO）
// 热部署
// models
// 爬虫
// https（已支持）
// Gzip(已支持)

// app.use('/', controlers.index)

module.exports = app

// const path = 'server1.js'
const getFile = path => {
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
          fs.close(fd, err => {
            err && reject(err)
            // console.log('文件关闭成功')
          })
        })
      })
    })
  })
}