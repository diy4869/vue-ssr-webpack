const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const WebpackBar = require('webpackbar')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// const PurgecssWebpackPlugin = require('purgecss-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin")
// const glob = require('glob')
// const path = require('path')
const smp = new SpeedMeasurePlugin()

module.exports = smp.wrap(
    merge(baseConfig, {
        mode: 'production',
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap:  true
                })
            ],
            namedModules: true,
            splitChunks: {
                chunks: 'all',
                minSize: 1024 * 10,
                cacheGroups: {
                    common: {
                        name: 'common'
                    },
                    vue: {
                        chunks: 'initial',
                        test: /[\\/]node_modules[\\/]vue/,
                        name: 'vue',
                    }
                }
            }
        },
        plugins: [
            new CleanWebpackPlugin(),
            new WebpackBar({
                name: 'Build',
                color: 'blue'
            }),
            new OptimizeCssAssetsPlugin({
                cssProcessor: require('cssnano'),
                cssProcessorPluginOptions: {
                    preset: ['default', {
                        discardComments: {
                            removeAll: true
                        }
                    }]
                }
            }),
            new BundleAnalyzerPlugin(),
            // new PurgecssWebpackPlugin({
            //     paths: glob.sync(`${path.join(__dirname, '../src/*')}`, { nodir: true })
            // })
        ]
    })
)