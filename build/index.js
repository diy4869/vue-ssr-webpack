const express = require('express')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const { createBundleRenderer } = require('vue-server-renderer')
const webpackBaseConfig = require('../webpack/webpack.base.config')
const webpackClientConfig = require('../webpack/webpack.client.config')
const webpackServerConfig = require('../webpack/webpack.server.config')
const server = express()
const options = {
    encoding: 'utf-8'
}

const build = () => {
    return new Promise(resolve => {
        webpack([
            webpackClientConfig,
            webpackServerConfig
        ]).run((err, stats) => {
            setImmediate(() => {
                const dir = webpackBaseConfig.output.path
                // server.use(express.static(baseConfig.output.path))

                console.log(dir)
                const clientManifest = fs.readFileSync(
                    path.resolve(dir, 'vue-ssr-client-manifest.json'),
                    options
                )

                const serverBundle = fs.readFileSync(
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
        template: fs.readFileSync(path.resolve(__dirname, './page/server.html'), options),
        clientManifest: JSON.parse(clientManifest)
    })
}

build().then(result => {
    const { serverBundle, clientManifest } = result

    server.get('*', (req, res) => {
        const context = {
            url: req.url,
            title: 'SSR'
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

server.listen(8080)

