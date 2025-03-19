const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
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
      template: './public/index.html'
    })
  ],
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3001,
    hot: true,
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
      },
      {
        context: ['/futu'],
        target: 'https://news.futunn.com',
        pathRewrite: { '^/futu': '' },
        changeOrigin: true,
        secure: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
          'Referer': 'https://news.futunn.com/'
        },
        logLevel: 'debug'
      }
    ]
  }
}; 