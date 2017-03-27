const webpack = require('webpack');
const path = require('path');
const DotenvPlugin = require('webpack-dotenv-plugin');

const sourcePath = path.join(__dirname, './');
const distPath = path.join(__dirname, './app/web/dist');

module.exports = () => {
  const nodeEnv = process.env.prod ? 'production' : 'development';
  const isProd = nodeEnv === 'production';

  const plugins = [
    new DotenvPlugin({
      // sample: './.env.default',
      path: './.env'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.bundle.js'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(nodeEnv),
        PLATFORM_ENV: JSON.stringify(process.env.PLATFORM_ENV),
        GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID),
        FB_CLIENT_ID: JSON.stringify(process.env.FB_CLIENT_ID),
        API_URL: JSON.stringify(process.env.API_URL)
      }
    }),
    new webpack.NamedModulesPlugin(),
  ];
  if (isProd) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
        },
        output: {
          comments: false,
        },
      })
    );
  }
  else {
    plugins.push(
      new webpack.HotModuleReplacementPlugin()
    );
  }

  return {
    devtool: isProd ? 'source-map' : 'cheap-module-source-map',
    context: sourcePath,

    entry: {
      app: './app/web/index.jsx',
      vendor: [
        'react',
        'react-dom',
        'react-redux',
        'redux-actions',
        'immutable',
        'babel-polyfill'
      ]
    },

    output: {
      path: distPath,
      filename: '[name].bundle.js',
    },

    module: {
      rules: [
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: {
            loader: 'file-loader',
            query: {
              name: '[name].[ext]'
            },
          },
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [
            'babel-loader'
          ],
        },
      ]
    },

    resolve: {
      extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
      modules: [
        path.resolve(__dirname, 'node_modules'),
        sourcePath
      ]
    },

    plugins,

    performance: isProd && {
      maxAssetSize: 100,
      maxEntrypointSize: 300,
      hints: 'warning',
    },

    stats: {
      colors: {
        green: '\u001b[32m',
      },
      errorDetails: true,
    },

    devServer: {
      contentBase: path.resolve(__dirname, 'app'),
      historyApiFallback: true,
      port: 3000,
      compress: isProd,
      inline: !isProd,
      hot: !isProd,
      stats: {
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
          green: '\u001b[32m',
        }
      }
    }
  };
};
