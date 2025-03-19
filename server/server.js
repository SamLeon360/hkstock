/**
 * @description 爬蟲API服務器
 * @module server
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const futuRoutes = require('./routes/futuRoutes');
const futuCrawler = require('./futuCrawler');

// 創建Express應用
const app = express();
const PORT = process.env.PORT || 3002;

// 配置CORS
app.use(cors({
  origin: '*', // 允許所有來源訪問，在生產環境中應設置為特定域名
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 中間件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 請求日誌
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  
  // 響應結束時記錄
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// API路由
app.use('/api/futu', futuRoutes);

// 靜態文件 - 生產環境使用
if (process.env.NODE_ENV === 'production') {
  // 使用 dist 目錄中的靜態文件
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // 對於任何不是API的請求，返回index.html (SPA)
  app.get('*', (req, res) => {
    // 排除API請求和靜態資源
    if (!req.url.startsWith('/api/') && !req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico)$/)) {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
      next();
    }
  });
}

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('服務器錯誤:', err.stack);
  res.status(500).json({
    code: 500,
    message: '服務器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`服務器已啟動，端口: ${PORT}`);
  console.log(`[${new Date().toLocaleString()}] 爬蟲API服務準備就緒`);
  console.log(`[${new Date().toLocaleString()}] 環境: ${process.env.NODE_ENV || 'development'}`);
  
  // 啟動後立即測試爬蟲
  console.log(`[${new Date().toLocaleString()}] 開始測試爬蟲功能...`);
  testCrawler();
});

/**
 * @description 測試爬蟲功能
 */
async function testCrawler() {
  try {
    console.log(`[${new Date().toLocaleString()}] 開始爬取富途快訊數據...`);
    const data = await futuCrawler.fetchFutuFlash();
    
    if (data && data.code === 0 && data.data && data.data.data && data.data.data.news) {
      const newsItems = data.data.data.news;
      console.log(`[${new Date().toLocaleString()}] 爬蟲測試成功! 獲取到 ${newsItems.length} 條快訊`);
      
      // 輸出前3條數據作為樣本
      if (newsItems.length > 0) {
        console.log('數據樣本:');
        newsItems.slice(0, 3).forEach((item, index) => {
          console.log(`===== 快訊 ${index + 1} =====`);
          console.log('ID:', item.id);
          console.log('標題:', item.title);
          console.log('內容:', item.content?.substring(0, 100) + (item.content?.length > 100 ? '...' : ''));
          console.log('時間:', new Date(item.time * 1000).toLocaleString());
          console.log('相關股票:', item.quote?.length || 0);
          console.log('------------------------');
        });
      }
    } else {
      console.log(`[${new Date().toLocaleString()}] 爬蟲測試失敗: 數據格式無效`);
      console.log('返回數據:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] 爬蟲測試出錯:`, error.message);
  }
}

// 處理未捕獲的異常
process.on('uncaughtException', (err) => {
  console.error('未捕獲的異常:', err);
  console.error('堆棧跟踪:', err.stack);
});

// 處理未處理的Promise拒絕
process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的Promise拒絕:', reason);
}); 