const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const VueSSRClientPlugin  = require('vue-server-renderer/client-plugin')
const path = require('path')
const WebpackBar = require('webpackbar')

module.exports = merge(baseConfig, {
    entry: [
        path.resolve(__dirname, '../src/entry-client.js'),
        'webpack-hot-middleware/client'
    ],
    optimization: {
        splitChunks: {
            name: 'manifest',
            minChunks: Infinity
        }
    },
    plugins: [
        new VueSSRClientPlugin(),
        new WebpackBar({
            name: 'Clinet',
            color: '#41b883'
        })
    ]
})