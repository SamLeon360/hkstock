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
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
          'Referer': 'https://news.futunn.com/',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Cookie': 'locale=zh-CN; device_id=web_SkzuDCzuE'
        },
        onProxyReq: (proxyReq, req, res) => {
          // 日誌請求路徑和頭信息
          console.log('代理請求到富途API:', req.method, req.url);
          
          // 確保有正確的content-length
          if(req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
          }
        },
        onProxyRes: (proxyRes, req, res) => {
          // 日誌響應狀態
          console.log('富途API響應:', proxyRes.statusCode, req.url);
          
          // 檢查是否有重定向
          if (proxyRes.statusCode === 302) {
            console.log('檢測到重定向:', proxyRes.headers.location);
          }
        },
        logLevel: 'debug'
      }
    ]
  }
}; 