const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

var env = process.env.NODE_ENV;

var config = {
  entry: {
    bundle: './src/admin/client/index.js',
    vendor: [
      'react',
      'react-dom',
      'redux',
      'react-redux',
      'redux-thunk',
      'react-router',
      'react-router-redux',
      'react-tinymce',
      'react-dropzone',
      'redux-form',
      'redux-form-material-ui',
      'material-ui'
    ]
  },

  output: {
    publicPath: '/',
    path: './public/',
    filename: 'admin-assets/js/app-[chunkhash].js'
  },

  resolve: {
    alias: {
      src: path.resolve('./src/admin/client'),
      layouts: path.resolve('./src/admin/client/layouts'),
      modules: path.resolve('./src/admin/client/modules'),
      lib: path.resolve('./src/admin/client/lib')
    },
    extensions: ['', '.js', '.jsx', '.json']
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }, {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json-loader'
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]')
      }
    ]
  },

  plugins: [
    new ExtractTextPlugin("admin-assets/css/bundle-[chunkhash].css"),
    new webpack.optimize.CommonsChunkPlugin("vendor", "admin-assets/js/vendor-[chunkhash].js"),
    new HtmlWebpackPlugin({template: 'src/admin/client/index.template.ejs', inject: 'body', 'filename':'admin/index.html'})
  ]
};

if (env === 'production') {
  config.plugins.push(new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }))

  config.plugins.push(new webpack.optimize.DedupePlugin())

  config.plugins.push(new webpack.BannerPlugin(`Created: ${new Date().toUTCString()}`)),

  config.stats = {
    colors: false,
    hash: false,
    version: false,
    timings: false,
    assets: false,
    chunks: false,
    modules: false,
    reasons: false,
    children: false,
    source: false,
    errors: false,
    errorDetails: false,
    warnings: false,
    publicPath: false
  }
}

module.exports = config;
