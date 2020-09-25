const express = require('express')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const { createBundleRenderer } = require('vue-server-renderer')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackBaseConfig = require('../webpack/webpack.base.config')
const webpackClientConfig = require('../webpack/webpack.client.config')
const webpackServerConfig = require('../webpack/webpack.server.config')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MemoryFileSystem = require('memory-fs')
const { merge } = require('webpack-merge')
const chokidar = require('chokidar')
const chalk = require('chalk')
const { read } = require('jimp')
const server = express()
const PORT = 8000
const baseConfig = merge(webpackBaseConfig, {})
const publicPath = baseConfig.output.publicPath
const options = {
    encoding: 'utf-8'
}
const memoryFS = new MemoryFileSystem()
const MultiCompiler = webpack([
    merge(webpackClientConfig, {
        entry: [
            `webpack-hot-middleware/client`
        ],
        plugins: [
            new CleanWebpackPlugin(),
            new webpack.HotModuleReplacementPlugin()
        ]
    }),
    webpackServerConfig
])
const hotMiddleware = webpackHotMiddleware(MultiCompiler, {
    noInfo: true,
    publicPath: publicPath
})
const devMiddleware = webpackDevMiddleware(MultiCompiler, {
    publicPath: publicPath,
    outputFileSystem: memoryFS,
    writeToDisk: true
    // serverSideRender: true
})
server
    .use(hotMiddleware)
    .use(devMiddleware)
    
// const log = (PORT = 3000) => {
//     // console.clear()
//     // eslint-disable-next-line no-irregular-whitespace
//     console.log(`${chalk.bgGreen(`${chalk.black(' DONE ')}`)}　SSR服务启动完成\n\n`)
//     console.log('  项目启动成功，地址是:\n')
//     console.log(`  - Local:   ${chalk.cyan(`http://localhost:${PORT}`)}`)
//     // console.log(`  - Network: ${chalk.cyan(`http://localhost:${PORT}`)}`)
// }

const build = () => {
    // Compiler.compilers[0].outputFileSystem = memoryFS
    // MultiCompiler.compilers.map(singleCompiler => {
    //     singleCompiler.outputFileSystem = memoryFS

    //     return singleCompiler
    // })

    return new Promise(resolve => {
        MultiCompiler.hooks.done.tap('done', () => {
            setImmediate(() => {
                // log(PORT)
                const dir = baseConfig.output.path

                // const result = memoryFS.readdirSync(dir)
                // console.log(result)
                const clientManifest = fs.readFileSync(
                    path.resolve(dir, 'vue-ssr-client-manifest.json'),
                    options
                )

                const serverBundle = fs.readFileSync(
                    path.resolve(dir, 'vue-ssr-server-bundle.json'),
                    options
                )

                server.use(express.static(dir))
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
        template: fs.readFileSync(path.resolve(__dirname, './page/server.html'), options),
        clientManifest: JSON.parse(clientManifest),
        
    })
}

build().then(result => {
    const { serverBundle, clientManifest } = result

    server.get('*', (req, res) => {
        const context = {
            url: req.url,
            title: 'SSR'
        }
        if (serverBundle && clientManifest) {
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
        }
        
    })
})

server
    .listen(PORT)
