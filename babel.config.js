const HTML_DEBUG = process.env.HTML_DEBUG || ""

module.exports = api => {
  api.cache(true)
  const plugins = [
    [
      "@babel/plugin-transform-runtime",
      {
        absoluteRuntime: true,
        regenerator: true,
        version: "^7.8.4"
      }
    ],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread"
  ]

  const presets = [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["> 0.25%"]
        }
      }
    ]
  ]

  if (HTML_DEBUG) {
    plugins.push("babel-plugin-react-generate-property")
  }

  return {
    sourceMaps: false,
    plugins,
    presets,
    env: {
      development: {
        sourceMaps: true,
        plugins
      },
      test: {
        presets,
        plugins
      }
    }
  }
}
