/* eslint-disable indent */
const path = require("path")

const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const webpack = require("webpack")
const VersionFile = require("webpack-version-file")
const SpriteLoaderPlugin = require("svg-sprite-loader/plugin")

const sourceDir = path.join(__dirname, "./src")
const sourceSVG = path.join(__dirname, "./src/assets/svg")
const sourceAudio = path.join(__dirname, "./src/assets/audio")

const buildDir = path.join(__dirname, "./build")
const entryPath = path.join(sourceDir, "./scripts/index.js")

const baseConfig = require("./webpack.config.base")
const {template} = require("@babel/core")

const htmlPageNames = ['new']

const multipleHtmlPlugins = htmlPageNames.map(name => {
  return new HtmlWebpackPlugin({
    inject: true,
    production: true,
    chunks: [`${name}`],
    filename: `${name}/index.html`,
    template: `./pages/${name}/index.html`,
    scriptLoading: 'defer',
    inlineSource: ".*main.*(css)$"
  })
})

const prodConfig = () => {
  return {
    mode: "production",
    devtool: "hidden-source-map",

    entry: {
      main: entryPath
    },

    output: {
      publicPath: "/",
      filename: "[chunkhash:5]-[id].js"
    },

    optimization: {
      emitOnErrors: false,
      minimize: true,
      sideEffects: false,
      concatenateModules: true,
      chunkIds: "deterministic",
      runtimeChunk: true,
      splitChunks: {
        chunks: "all"
      },

      moduleIds: "deterministic"
    },

    plugins: [
      // Remove moment locales
      new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),

      new VersionFile({ output: "./build/version.txt" }),

      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, "public"),
            to: path.join(buildDir, "static"),
            globOptions: {
              ignore: "_redirects"
            }
          },
          {
            from: path.join(__dirname, "public", "_redirects"),
            to: buildDir
          },
          { from: "./assets/favicon.ico" }
        ]
      }),

      new HtmlWebpackPlugin({
        inject: true,
        production: true,
        chunks: "all",
        filename: "index.html",
        template: 'index.html',
        scriptLoading: 'defer',
        inlineSource: ".*main.*(css)$"
      }),

      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
        chunkFilename: "[id].[contenthash].css",
      }),
      new SpriteLoaderPlugin({
        plainSprite: true,
        spriteAttrs: {
          class: "icon-sprite"
        }
      })
    ].concat(multipleHtmlPlugins),

    module: {
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
          test: /\.(ts|tsx|js)$/,
          exclude: [/node_modules\/(?!(@datepicker-react)\/).*/, /\.test\.js(x)?$/],
          include: sourceDir,
          loader: "babel-loader"
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
                    sourceMap: false,
                    url: true,
                    import: true,
                    importLoaders: 2,
                    modules: {
                      localIdentName: "[local]--[contenthash:base64:5]"
                    }
                  }
                },
                {
                  loader: "postcss-loader",
                  options: {
                    postcssOptions: () => [
                      {
                        "postcss-preset-env": {
                          state: 0,
                          autoprefixer: {
                            grid: true
                          }
                        }
                      }
                    ],
                    sourceMap: false
                  }
                },
                {
                  loader: "sass-loader",
                  options: { sourceMap: false }
                }
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

module.exports = baseConfig(prodConfig())
