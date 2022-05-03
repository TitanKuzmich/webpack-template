/* eslint-disable indent */
const path = require("path")

const webpack = require("webpack")
const envFile = require("dotenv").config({ path: path.join(__dirname, "./.env") }).parsed

const sourceDir = path.join(__dirname, "./src")
const buildDir = path.join(__dirname, "./build")

const stats = {
  assets: true,
  children: false,
  chunks: false,
  hash: false,
  modules: false,
  publicPath: false,
  timings: true,
  version: false,
  warnings: true,
  colors: {
    green: "\u001b[32m"
  }
}

process.noDeprecation = true

module.exports = config => {
  try {
    const { mode, entry, optimization, host, port, module, output, plugins, devtool } = config

    return {
      mode,
      devtool,
      optimization,
      entry,
      module,

      context: sourceDir,

      output: Object.assign(
        {
          path: buildDir,
          publicPath: "/",
          assetModuleFilename: "static/[id]-[contenthash:5].[ext]"
        },
        output
      ),

      cache: {
        type: "filesystem"
      },

      plugins: [
        // setting production environment will strip out
        // some of the development code from the app
        // and libraries
        new webpack.DefinePlugin({
          "process.env": {
            NODE_ENV: JSON.stringify(envFile.NODE_ENV || "development"),
            API_DOMAIN: JSON.stringify(envFile.API_DOMAIN)
          }
        })
      ]
        // join with prod/dev plugins
        .concat(plugins)
        // removed null plugins
        .filter(Boolean),

      resolve: {
        extensions: [".js", ".jsx", ".json", ".scss", ".css", ".m.scss", ".m.css"],
        modules: [path.resolve(__dirname, "./src"), "./node_modules"],

        alias: {
          "@components": path.resolve(__dirname, "./src/app/components"),
          "@app": path.resolve(__dirname, "./src/app"),
          "@assets": path.resolve(__dirname, "./src/assets"),
          "@utils": path.resolve(__dirname, "./src/utils"),
          "@lib": path.resolve(__dirname, "./src/lib"),
          "@actions": path.resolve(__dirname, "./src/actions"),
          "@styles": path.resolve(__dirname, "./src/styles"),
          "@routes": path.resolve(__dirname, "./src/routes")
        }
      },

      stats,

      devServer: {
        devMiddleware: {
          writeToDisk: true,
        },
        historyApiFallback: {
          rewrites: [{ from: /./, to: "/index.html" }]
        },
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        static: {
          staticOptions: {
            contentBase: sourceDir,
            watchOptions: {
              ignored: ["node_modules", "*.svg", "*.wav"]
            }
          },
          publicPath: "/"
        },

        compress: true,
        allowedHosts: "all",
        host,
        port
      }
    }
  } catch (err) {
    console.log("\033[31m", err)
  }
  return null
}
