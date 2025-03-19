const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 判断是否为生产环境
const isProduction = process.env.NODE_ENV === 'production' || process.argv.indexOf('--mode=production') !== -1 || process.argv.indexOf('--mode') !== -1 && process.argv[process.argv.indexOf('--mode') + 1] === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // 添加缓存以加快重构速度
            cacheDirectory: true,
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: true,
      scriptLoading: 'defer'
    })
  ],
  // 简化优化配置，以避免冲突
  optimization: {
    minimize: isProduction,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  // 生产环境用更快的sourcemap
  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3001,
    hot: true,
    host: '0.0.0.0',
    allowedHosts: ['hkstock.atomtechnology.com.hk', 'localhost', '.localhost'],
    proxy: [
      {
        context: ['/jin10'],
        target: 'https://open-data-api.jin10.com',
        pathRewrite: { '^/jin10': '' },
        changeOrigin: true,
        secure: false,
        headers: {
          'secret-key': 'p7nYZHbya6PJtABF0ul_7'
        },
        logLevel: 'debug'
      }
    ]
  }
}; 