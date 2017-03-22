'use strict';
const path              = require('path');
const webpack           = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const npmPackage        = require('./package.json');
const DashboardPlugin   = require('webpack-dashboard/plugin');
const host              = '0.0.0.0';
const port              = 3003;

const srcRoot  = 'src';
const srcPath  = path.resolve(__dirname, srcRoot);
const distPath = path.resolve(__dirname, 'dist');


module.exports = function (env = process.env.NODE_ENV) {
  const prod = env === 'production';
  const dev = !prod;
  
  const config = {
    entry: {
      app: `./${srcRoot}/app.js`
    },
    
    output: {
      path:       distPath,
      publicPath: dev ? '/' : '',
      filename:   dev ? '[name].js' : '[name]-[hash].js',
      pathinfo:   dev
    },
    
    resolve: {
      modules: [
        'node_modules'
      ],
      extensions: ['.js', '.jsx', '.json']
    },
    
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            {loader: 'style-loader'},
            {loader: 'css-loader', options: {sourceMap: dev, importLoaders: 1}},
            {loader: 'postcss-loader'}
          ],
          exclude: /node_modules/
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: dev ? 65000 : 8192,
                name: dev ? 'images/[name].[ext]' : 'images/[name]-[hash].[ext]'
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.(woff|woff2)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: dev ? 65000 : 8192,  // in dev mode it works better to embed the fonts
                name: dev ? 'fonts/[name].[ext]' : 'fonts/[name]-[hash].[ext]'
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.(eot|ttf)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
                name: 'fonts/[name].[ext]'
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.json$/,
          use: 'json-loader'
        }
      ]
    },
    
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {NODE_ENV: JSON.stringify(env || 'development')}
      }),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(npmPackage.version)
      }),
      new HtmlWebpackPlugin({
        template: `${srcRoot}/index.html`,
        title: 'CS STRATS',
        inject: 'body'
      })
    ],
    
    stats: 'errors-only'
  };
  
  if (dev) {
    // development specific settings
    config.entry.hmr = 'webpack/hot/only-dev-server';
    config.entry.app = ['react-hot-loader/patch', `./${srcRoot}/app.js`];
    config.devtool = 'cheap-module-eval-source-map';
    config.performance = {hints: false};
    config.devServer = {
      port:        port,
      host:        host,
      quiet:       true,
      hot:         true,
      contentBase: srcPath,
      historyApiFallback: true,
      stats: {
        hash:    false,
        colors:  true,
        cached:  false,
        version: false
      }
    };
    
    config.plugins = [
      new DashboardPlugin({port: port + 100}),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      ...config.plugins
    ];
  } else {
    // production specific options
    
  }
  
  return config;
};
