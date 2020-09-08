const server = require('express')()
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const { createBundleRenderer } = require('vue-server-renderer')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackBaseConfig = require('../webpack/webpack.base.config')
const webpackClientConfig = require('../webpack/webpack.client.config')
const webpackServerConfig = require('../webpack/webpack.server.config')
const MemoryFileSystem = require('memory-fs')
const { merge } = require('webpack-merge')
const chokidar = require('chokidar')
const chalk = require('chalk')

const PORT = 8000
const baseConfig = merge(webpackBaseConfig, {
    watch: true,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules/
    }
})
const publicPath = baseConfig.output.publicPath
const options = {
    encoding: 'utf-8'
}
const memoryFS = new MemoryFileSystem()
const Compiler = webpack([
    merge(webpackClientConfig, {
        plugins: [
            new webpack.HotModuleReplacementPlugin()
        ]
    }),
    webpackServerConfig
])
const devMiddleware = webpackDevMiddleware(Compiler, {
    publicPath: publicPath,
    serverSideRender: true
})
const hotMiddleware = webpackHotMiddleware(Compiler, {
    noInfo: true,
    quiet: true,
    publicPath: publicPath
})
const log = (PORT = 3000) => {
    console.clear()
    // eslint-disable-next-line no-irregular-whitespace
    console.log(`${chalk.bgGreen(`${chalk.black(' DONE ')}`)}　SSR服务启动完成\n\n`)
    console.log('  项目启动成功，地址是:\n')
    console.log(`  - Local:   ${chalk.cyan(`http://localhost:${PORT}`)}`)
    // console.log(`  - Network: ${chalk.cyan(`http://localhost:${PORT}`)}`)
}
const build = () => {
    Compiler.compilers.map(singleCompiler => {
        singleCompiler.outputFileSystem = memoryFS

        return singleCompiler
    })

    return new Promise(resolve => {
        Compiler.hooks.done.tap('done', () => {
            setImmediate(() => {
                log(PORT)
                const dir = baseConfig.output.path
                const clientManifest = memoryFS.readFileSync(
                    path.resolve(dir, 'vue-ssr-client-manifest.json'),
                    options
                )
                const serverBundle = memoryFS.readFileSync(
                    path.resolve(dir, 'vue-ssr-server-bundle.json'),
                    options
                )

                resolve({
                    clientManifest,
                    serverBundle
                })
            })
        })
    })
}

/**
 * 
 * @param {string} serverBundle 
 * @param {string} clientManifest 
 */
const render = (serverBundle, clientManifest) => {
    return createBundleRenderer(JSON.parse(serverBundle), {
        runInNewContext: false,
        template: fs.readFileSync('./page/server.html', options),
        clientManifest: JSON.parse(clientManifest)
    })
}

build().then(res => {
    const { serverBundle, clientManifest } = res
    
    server.get('*', (req, res) => {
        const context = {
            url: req.url
        }
        
        render(serverBundle, clientManifest).renderToString(context, (err, html) => {
            if (err) {
                if (err.code === 404) {
                    res.status(404).end('404')
                } else {
                    res.status(500).end('500')
                }
            } else {
                res.end(html)
            }
        })
    })
})

server
    .use(devMiddleware)
    .use(hotMiddleware)
    .listen(PORT)
