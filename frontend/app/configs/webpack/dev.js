// development config
const merge = require('webpack-merge');
const webpack = require('webpack');
const commonConfig = require('./common');

module.exports = merge(commonConfig, {
  mode: 'development',
  entry: [
    'react-hot-loader/patch', // activate HMR for React
    `webpack-dev-server/client?http://localhost:${process.env.REACT_APP_DEV_PORT}`,// bundle the client for webpack-dev-server and connect to the provided endpoint
    'webpack/hot/only-dev-server', // bundle the client for hot reloading, only- means to only hot reload for successful updates
    './index.tsx' // the entry point of our app
  ],
  devServer: {
    hot: true, // enable HMR on the server
    host: '0.0.0.0',
    disableHostCheck: true,
    historyApiFallback: true,
    publicPath: '/',
  },
  output: {
    publicPath: '/',
  }, 
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // enable HMR globally
    new webpack.DefinePlugin({
      'process.env': {
          NODE_ENV: JSON.stringify('development'),
          REACT_APP_TITLE: JSON.stringify('Local FAST'),
      }
    }),
  ],
});
