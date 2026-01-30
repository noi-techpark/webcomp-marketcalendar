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
    clean: true
  },
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.css$/i, use: [{ loader: 'css-loader', options: { exportType: 'string' } }] },
      { test: /\.(png|jpe?g|gif|svg|webp)$/i, type: 'asset/inline' },
      { test: /\.(woff2?|eot|ttf|otf)$/i, type: 'asset/inline' },
      { test: /\.config$/, type: 'asset/source' }
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
    }),
  ],
  devServer: {
    static: './public',
    port: 8998,
    hot: true
  },
  devtool: 'inline-source-map',
};
