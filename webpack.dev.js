// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: CC0-1.0

const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: 'webcomp-market-calendar.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.css$/i, use: [{ loader: 'css-loader', options: { exportType: 'string' } }] },
      { test: /\.(png|jpe?g|gif|svg|webp)$/i, type: 'asset/inline' },
      { test: /\.(woff2?|eot|ttf|otf)$/i, type: 'asset/inline' },
      { test: /\.preset$/, type: 'asset/source' }
    ],
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.esm-bundler.js',
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'true',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      'process.env.VUE_APP_TOURISM_BASE_PATH': JSON.stringify(process.env.VUE_APP_TOURISM_BASE_PATH || ''),
      'process.env.VUE_APP_ORIGIN': JSON.stringify(process.env.VUE_APP_ORIGIN || ''),
    }),
  ],
  devServer: {
    static: [
      './public',
      // Serve production build at /dist/ so other sites can embed it without HMR/WebSocket
      { directory: path.join(__dirname, 'dist'), publicPath: '/dist' },
    ],
    devMiddleware: {
      writeToDisk: true,
    },
    port: 8998,
    hot: false,
    liveReload: false,
    client: false,
    // Allow loading the script from another site (e.g. embed on different origin)
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  devtool: 'inline-source-map',
};
