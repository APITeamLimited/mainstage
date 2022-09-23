const webpack = require('webpack')
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

/** @returns {import('webpack').Configuration} Webpack Configuration */
module.exports = (config, { mode }) => {
  if (mode === 'development') {
    // Add dev plugin
    config.plugins.push(new BundleAnalyzerPlugin())
  }

  // Add custom rules for your project
  // config.module.rules.push(YOUR_RULE)

  config.module.rules.push({
    test: /\.md$/i,
    use: 'raw-loader',
  })

  // Add custom plugins for your project
  // config.plugins.push(YOUR_PLUGIN)

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser'),
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  )

  config.resolve.fallback = {
    path: require.resolve('path-browserify'),
    process: require.resolve('process/browser'),
    stream: require.resolve('stream-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    timers: require.resolve('timers-browserify'),
    crypto: require.resolve('crypto-browserify'),
    zlib: require.resolve('browserify-zlib'),
    fs: false,
    buffer: require.resolve('buffer'),
  }

  return config
}
