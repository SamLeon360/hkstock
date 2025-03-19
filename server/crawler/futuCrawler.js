/**
 * @description 富途爬蟲模塊 - 用於抓取富途網站的數據
 * @module futuCrawler
 */
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// 緩存機制
let flashNewsCache = [];
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分鐘緩存時間

/**
 * @description 格式化日期
 * @param {string} timeStr - 原始時間字符串
 * @returns {number} Unix時間戳（秒）
 */
function parseTimeToTimestamp(timeStr) {
  try {
    if (!timeStr) return Math.floor(Date.now() / 1000);
    
    // 處理格式為 "MM-DD HH:MM" 或 "HH:MM" 的時間
    const now = new Date();
    const year = now.getFullYear();
    
    // 檢查是否有日期部分
    let month, day, time;
    if (timeStr.includes('-')) {
      // 格式為 "MM-DD HH:MM"
      const parts = timeStr.split(' ');
      const dateParts = parts[0].split('-');
      month = parseInt(dateParts[0], 10) - 1; // 月份從0開始
      day = parseInt(dateParts[1], 10);
      time = parts[1];
    } else {
      // 只有時間部分 "HH:MM"
      month = now.getMonth();
      day = now.getDate();
      time = timeStr;
    }
    
    const timeParts = time.split(':');
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    
    const date = new Date(year, month, day, hour, minute, 0);
    return Math.floor(date.getTime() / 1000);
  } catch (error) {
    console.error('解析時間失敗:', error);
    return Math.floor(Date.now() / 1000);
  }
}

/**
 * @description 簡單爬蟲 - 使用axios直接請求富途快訊頁面
 * @returns {Promise<Array>} 快訊列表
 */
async function crawlFutuFlashSimple() {
  try {
    // 檢查緩存是否有效
    const now = Date.now();
    if (flashNewsCache.length > 0 && (now - lastCacheTime) < CACHE_DURATION) {
      console.log(`使用緩存的${flashNewsCache.length}條富途快訊數據`);
      return flashNewsCache;
    }
    
    console.log('開始爬取富途快訊...');
    const response = await axios.get('https://news.futunn.com/flash', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://news.futunn.com/',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    // 使用cheerio加載HTML
    const $ = cheerio.load(response.data);
    const flashItems = [];
    
    // 解析富途快訊列表
    $('.flash-item').each((index, element) => {
      try {
        // 提取標題和內容
        const title = $(element).find('.flash-item-title').text().trim();
        const content = $(element).find('.flash-item-content').text().trim();
        
        // 提取時間和ID
        const timeStr = $(element).find('.flash-item-time').text().trim();
        const time = parseTimeToTimestamp(timeStr);
        const id = $(element).attr('data-id') || `flash-${Date.now()}-${index}`;
        
        // 提取相關股票
        const quotes = [];
        $(element).find('.quote-item').each((i, quoteEl) => {
          try {
            const code = $(quoteEl).attr('data-code');
            const name = $(quoteEl).find('.quote-name').text().trim();
            const price = $(quoteEl).find('.quote-current').text().trim();
            const changeText = $(quoteEl).find('.quote-change').text().trim();
            const changeRatio = parseFloat(changeText.replace('%', '')) / 100;
            
            if (code && name) {
              quotes.push({
                code,
                name,
                price: parseFloat(price) || 0,
                changeRatio: changeRatio || 0,
                stockMarket: code.startsWith('HK') ? 'hk' : 
                             code.startsWith('US') ? 'us' : 'cn'
              });
            }
          } catch (err) {
            console.warn('解析股票數據失敗:', err);
          }
        });
        
        // 創建快訊對象
        if (title && content) {
          flashItems.push({
            id,
            title,
            content,
            time,
            quote: quotes
          });
        }
      } catch (itemError) {
        console.warn('解析快訊項目失敗:', itemError);
      }
    });
    
    console.log(`成功抓取${flashItems.length}條富途快訊`);
    
    // 更新緩存
    flashNewsCache = flashItems;
    lastCacheTime = now;
    
    return flashItems;
  } catch (error) {
    console.error('爬取富途快訊失敗:', error);
    
    // 如果有緩存，返回緩存數據
    if (flashNewsCache.length > 0) {
      console.log('返回緩存的快訊數據');
      return flashNewsCache;
    }
    
    // 沒有緩存或爬取失敗，返回空數組
    return [];
  }
}

/**
 * @description 高級爬蟲 - 使用Puppeteer模擬瀏覽器訪問富途快訊頁面
 * @returns {Promise<Array>} 快訊列表
 */
async function crawlFutuFlashAdvanced() {
  try {
    // 檢查緩存是否有效
    const now = Date.now();
    if (flashNewsCache.length > 0 && (now - lastCacheTime) < CACHE_DURATION) {
      console.log(`使用緩存的${flashNewsCache.length}條富途快訊數據`);
      return flashNewsCache;
    }
    
    console.log('開始使用Puppeteer爬取富途快訊...');
    
    // 啟動瀏覽器
    const browser = await puppeteer.launch({
      headless: 'new',  // 使用新的無頭模式
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // 設置瀏覽器標識
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // 設置視窗大小
      await page.setViewport({ width: 1280, height: 800 });
      
      // 訪問富途快訊頁面
      await page.goto('https://news.futunn.com/flash', {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // 等待頁面加載
      await page.waitForSelector('.flash-item', { timeout: 10000 });
      
      // 獲取頁面內容
      const content = await page.content();
      
      // 使用cheerio解析內容
      const $ = cheerio.load(content);
      const flashItems = [];
      
      // 解析富途快訊列表
      $('.flash-item').each((index, element) => {
        try {
          // 提取標題和內容
          const title = $(element).find('.flash-item-title').text().trim();
          const content = $(element).find('.flash-item-content').text().trim();
          
          // 提取時間和ID
          const timeStr = $(element).find('.flash-item-time').text().trim();
          const time = parseTimeToTimestamp(timeStr);
          const id = $(element).attr('data-id') || `flash-${Date.now()}-${index}`;
          
          // 提取相關股票
          const quotes = [];
          $(element).find('.quote-item').each((i, quoteEl) => {
            try {
              const code = $(quoteEl).attr('data-code');
              const name = $(quoteEl).find('.quote-name').text().trim();
              const price = $(quoteEl).find('.quote-current').text().trim();
              const changeText = $(quoteEl).find('.quote-change').text().trim();
              const changeRatio = parseFloat(changeText.replace('%', '')) / 100;
              
              if (code && name) {
                quotes.push({
                  code,
                  name,
                  price: parseFloat(price) || 0,
                  changeRatio: changeRatio || 0,
                  stockMarket: code.startsWith('HK') ? 'hk' : 
                               code.startsWith('US') ? 'us' : 'cn'
                });
              }
            } catch (err) {
              console.warn('解析股票數據失敗:', err);
            }
          });
          
          // 創建快訊對象
          if (title && content) {
            flashItems.push({
              id,
              title,
              content,
              time,
              quote: quotes
            });
          }
        } catch (itemError) {
          console.warn('解析快訊項目失敗:', itemError);
        }
      });
      
      console.log(`成功抓取${flashItems.length}條富途快訊`);
      
      // 更新緩存
      flashNewsCache = flashItems;
      lastCacheTime = now;
      
      return flashItems;
    } finally {
      // 確保瀏覽器關閉
      await browser.close();
    }
  } catch (error) {
    console.error('使用Puppeteer爬取富途快訊失敗:', error);
    
    // 嘗試使用簡單爬蟲作為備用方案
    try {
      console.log('嘗試使用簡單爬蟲作為備用...');
      return await crawlFutuFlashSimple();
    } catch (backupError) {
      console.error('備用爬蟲也失敗:', backupError);
      
      // 如果有緩存，返回緩存數據
      if (flashNewsCache.length > 0) {
        console.log('返回緩存的快訊數據');
        return flashNewsCache;
      }
      
      // 沒有緩存或爬取失敗，返回空數組
      return [];
    }
  }
}

/**
 * @description 獲取富途快訊
 * @returns {Promise<Array>} 富途快訊列表
 */
async function getFutuFlash() {
  try {
    // 首先嘗試簡單爬蟲
    const simpleResult = await crawlFutuFlashSimple();
    if (simpleResult && simpleResult.length > 0) {
      return simpleResult;
    }
    
    // 如果簡單爬蟲失敗，嘗試高級爬蟲
    return await crawlFutuFlashAdvanced();
  } catch (error) {
    console.error('獲取富途快訊失敗:', error);
    
    // 即使兩種方式都失敗，仍然返回緩存或空數組
    if (flashNewsCache.length > 0) {
      return flashNewsCache;
    }
    return [];
  }
}

module.exports = {
  getFutuFlash
}; 