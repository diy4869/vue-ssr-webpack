const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const vueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const ENV = require('./env')

const baseConfig = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name]_[hash:8].js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    // 'vue-style-loader',
                    'css-loader',
                    'postcss-loader',
                ]
            },
            {
                test: /\.(scss|sass)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    // 'vue-style-loader',
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.js$/,
                exclude: [
                    path.resolve(__dirname, 'node_modules')
                ],
                loader: 'babel-loader?cacheDirectory=true'
            },
            {
                test: /\.(jpg|jpeg|webp|png)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: 'assets/image/[name]_[hash:8].[ext]',
                            limit: 1024 * 10,
                            publicPath: '/',
                            // outpubPath: '/assets/image/',
                            fallback: 'responsive-loader',
                            quality: 70
                        }
                    }
                ]
            },
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'thread-loader'
                    },
                    {
                        loader: 'vue-loader',
                        options: {
                            extractCSS: ENV === 'production'
                        }
                    }
                    
                ]
            }
        ]
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../src'),
            '~': path.resolve(__dirname, '../src/assets')
        },
        // enforceModuleExtension: true,
        extensions: ['.js', '.json', '.vue']
    },
    devtool: 'source-map',
    stats: {
        source: false,
        modules: false
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //     title: 'hello Vue SSR',
        //     template: path.resolve(__dirname, '../src/page/index.html'),
        //     inject: true,
        //     filename: 'index.html'
        // }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(ENV)
        }),
        new vueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name]_[contentHash:8].css',
            chunkFilename: 'assets/css/[name]_[contentHash:8].css'
        })
    ]
}

module.exports = baseConfig
