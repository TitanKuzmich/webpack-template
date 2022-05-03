/* eslint-disable */
const path = require("path")
const glob = require('glob')
const ramda = require("ramda")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const SpriteLoaderPlugin = require("svg-sprite-loader/plugin")

const envFile = require("dotenv").config({path: path.join(__dirname, "./.env")}).parsed

const sourceDir = path.join(__dirname, "./src")
const sourceSVG = path.join(__dirname, "./src/assets/svg")
const sourceAudio = path.join(__dirname, "./src/assets/audio")

const entryPath = path.join(sourceDir, "./scripts/index.js")

const baseConfig = require("./webpack.config.base")

const htmlPageNames = ['new']

const multipleHtmlPlugins = htmlPageNames.map(name => {
    return new HtmlWebpackPlugin({
        inject: true,
        chunks: [`${name}`],
        filename: `${name}/index.html`,
        template: `./pages/${name}/index.html`,
        scriptLoading: 'defer',
        inlineSource: ".*main.*(css)$"
    })
})

const devConfig = () => {
    // replace localhost with 0.0.0.0 if you want to access
    // your app from wifi or a virtual machine
    if (ramda.isNil(envFile)) {
        throw Error("Env file is not defined. Pls configure .env")
    }

    if (ramda.isNil(envFile.HOST) || ramda.isNil(envFile.PORT)) {
        throw Error("PORT or HOST is not defined. Pls configure .env")
    }

    const host = envFile.HOST
    const port = envFile.PORT
    return {
        mode: "development",
        devtool: "eval-cheap-source-map", //"inline-source-map",
        host,
        port,
        entry: {
            front: [
                // bundle the client for webpack-dev-server
                // and connect to the provided endpoint
                `webpack-dev-server/client?http://${host}:${port}`,

                // the entry point of our app
                entryPath
            ]
        },
        debug: false,

        optimization: {
            moduleIds: "deterministic",
            runtimeChunk: "single",
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendors",
                        chunks: "all"
                    }
                }
            }
        },

        output: {
            publicPath: "/",
            filename: "[chunkhash:5]-[name].js",
            pathinfo: false
        },

        plugins: [
            new CleanWebpackPlugin(),

            new HtmlWebpackPlugin({
                inject: true,
                chunks: "all",
                filename: "index.html",
                template: "index.html",
                scriptLoading: 'defer',
                inlineSource: ".*main.*(css)$"
            }),

            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css",
            }),

            new SpriteLoaderPlugin()
        ].concat(multipleHtmlPlugins),

        module: {
            unsafeCache: true,
            rules: [
                {
                    test: /\.svg$/,
                    include: sourceSVG,
                    loader: "svg-sprite-loader",

                    options: {}
                },
                {
                    test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$/,
                    include: sourceDir,
                    exclude: sourceSVG,
                    type: "asset/resource"
                },
                {
                    test: /\.(js|jsx)$/,
                    include: sourceDir,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                cacheCompression: false,
                                cacheDirectory: true
                            }
                        }
                    ]
                },
                {
                    test: /\.m?js/,
                    resolve: {
                        fullySpecified: false
                    }
                },
                {
                    test: /\.wav$/,
                    include: sourceAudio,
                    loader: "file-loader"
                },
                {
                    test: /\.s?css$/,
                    oneOf: [
                        {
                            test: /\.m\.s?css$/,
                            use: [
                                {
                                    loader: MiniCssExtractPlugin.loader
                                },
                                {
                                    loader: "css-loader",
                                    options: {
                                        modules: {
                                            localIdentName: "[name]__[local]--[hash:base64:5]"
                                        }
                                    }
                                },
                                {
                                    loader: "postcss-loader",
                                    options: {
                                        postcssOptions: {
                                            plugins: [
                                                [
                                                    "postcss-preset-env",
                                                    {
                                                        state: 0,
                                                        autoprefixer: {
                                                            grid: true
                                                        }
                                                    }
                                                ]
                                            ]
                                        },
                                        sourceMap: true
                                    }
                                },
                                {loader: "sass-loader", options: {sourceMap: false}}
                            ]
                        },
                        {
                            use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
                        }
                    ]
                }
            ]
        }
    }
}

module.exports = baseConfig(devConfig())
