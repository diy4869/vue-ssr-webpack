const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const webpack = require('webpack')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        host: 'localhost',
        port: 9000,
        hot: true,
        compress: true,
        noInfo: true,
        open: true,
        quiet: true,
        // useLocalIp: true,
        overlay: {
            errors: true,
            warnings: false
        },
        contentBase: '../src',
        publicPath: baseConfig.output.publicPath
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new FriendlyErrorsWebpackPlugin()
    ]
})