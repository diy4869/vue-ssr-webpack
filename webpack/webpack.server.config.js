const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const path = require('path')
const WebpackBar = require('webpackbar')

module.exports = merge(baseConfig, {
    entry: path.resolve(__dirname, '../src/entry-server.js'),
    target: 'node',
    output: {
        libraryTarget: 'commonjs2'
    },
    externals: nodeExternals({
        allowlist: /\.css$/
    }),
    plugins: [
        new VueSSRServerPlugin(),
        new WebpackBar({
            name: 'Server',
            color: 'blue'
        })
    ]
})
