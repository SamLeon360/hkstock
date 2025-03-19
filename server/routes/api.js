/**
 * @description API路由模塊 - 處理API請求
 * @module apiRoutes
 */
const express = require('express');
const router = express.Router();
const futuCrawler = require('../crawler/futuCrawler');

/**
 * @description 富途快訊API - 獲取富途快訊列表
 * @route GET /api/futu/flash
 */
router.get('/futu/flash', async (req, res) => {
  try {
    console.log('收到富途快訊API請求');
    
    // 獲取富途快訊列表
    const flashItems = await futuCrawler.getFutuFlash();
    
    // 格式化為前端所需格式
    const formattedResponse = {
      code: 0,
      data: {
        data: {
          news: flashItems
        }
      }
    };
    
    console.log(`響應富途快訊API請求，返回${flashItems.length}條數據`);
    res.json(formattedResponse);
  } catch (error) {
    console.error('處理富途快訊API請求時發生錯誤:', error);
    res.status(500).json({
      code: 500,
      message: '獲取富途快訊失敗'
    });
  }
});

/**
 * @description 健康檢查API - 確認服務器運行狀態
 * @route GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'hkstock-crawler'
  });
});

module.exports = router; 