const CopyPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

/** @returns {import('webpack').Configuration} Webpack Configuration */
module.exports = (config, { mode }) => {
  // Add custom rules for your project
  // config.module.rules.push(YOUR_RULE)

  config.module.rules.push({
    test: /\.md$/i,
    use: 'raw-loader',
  })

  // Add custom plugins for your project
  // config.plugins.push(YOUR_PLUGIN)
  config.plugins.push(
    new CopyPlugin({
      patterns: [{ from: '../packages/docs/src/content', to: 'public/docs' }],
    })
  )

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser'),
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

  // Override redwood react dom with root react dom
  // Drastically reduces bundle size and prevents 2 versions of react-dom from
  // incorrectly being loaded
  config.resolve.alias['react-dom'] = require.resolve('react-dom')

  // Dev specific settings
  if (mode === 'development') {
    // Redirect dev server to use different endpoint
    config.devServer.proxy = {
      '/api': {
        target: `http://${process.env.API_HOST}:${process.env.API_PORT}`,
        // Enable cors
        changeOrigin: true,

        // Rewrite path
        pathRewrite: { '^/api': '' },

        ws: true,
      },
    }

    config.plugins.push(new BundleAnalyzerPlugin())
  }

  // Provide support for webassembly
  config.experiments = {
    asyncWebAssembly: true,
    syncWebAssembly: true,
  }

  return config
}
