/**
 * @description 富途API路由處理
 * @module futuRoutes
 */
const express = require('express');
const router = express.Router();
const futuCrawler = require('../futuCrawler');

/**
 * @description 健康檢查端點
 * @route GET /api/futu/health
 * @returns {object} 健康狀態
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    service: 'futu-crawler'
  });
});

/**
 * @description 獲取富途快訊
 * @route GET /api/futu/flash
 * @returns {object} 富途快訊數據
 */
router.get('/flash', async (req, res) => {
  try {
    console.log(`[${new Date().toLocaleString()}] 接收到富途快訊請求`);
    
    // 調用爬蟲獲取數據
    const flashData = await futuCrawler.fetchFutuFlash();
    
    // 檢查數據並返回
    if (flashData && flashData.code === 0) {
      return res.json({
        code: 0,
        message: '獲取富途快訊成功',
        data: flashData.data
      });
    } else {
      throw new Error('富途快訊數據格式無效');
    }
  } catch (error) {
    console.error('處理富途快訊請求失敗:', error.message);
    
    // 返回錯誤響應
    return res.status(500).json({
      code: 500,
      message: `獲取富途快訊失敗: ${error.message}`,
      data: null
    });
  }
});

module.exports = router; 