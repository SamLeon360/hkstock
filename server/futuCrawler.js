/**
 * @description 富途新聞爬蟲模塊
 * @module futuCrawler
 */
const axios = require('axios');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// 緩存數據和時間戳
let cache = {
  flashNews: null,
  lastUpdate: null
};

// 默認緩存時間: 5分鐘
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * @description 富途API客戶端
 */
const futuClient = axios.create({
  baseURL: 'https://news.futunn.com',
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Referer': 'https://news.futunn.com/flash',
    'Origin': 'https://news.futunn.com'
  }
});

/**
 * @description 生成隨機設備ID
 * @returns {string} 隨機設備ID
 */
const generateDeviceId = () => {
  const prefix = 'web_';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * @description 獲取當前時間戳
 * @returns {number} 當前時間戳（毫秒）
 */
const getCurrentTimestamp = () => {
  return Date.now();
};

/**
 * @description 檢查並返回緩存的數據
 * @returns {Object|null} 緩存的數據或null
 */
const getCache = () => {
  if (cache.flashNews && cache.lastUpdate) {
    const now = Date.now();
    const elapsed = now - cache.lastUpdate;
    
    // 檢查緩存是否有效
    if (elapsed < CACHE_DURATION) {
      console.log(`使用緩存的富途快訊數據，緩存時間: ${Math.round(elapsed/1000)}秒`);
      return cache.flashNews;
    }
  }
  
  return null;
};

/**
 * @description 更新緩存
 * @param {Object} data - 要緩存的數據
 */
const updateCache = (data) => {
  cache.flashNews = data;
  cache.lastUpdate = Date.now();
  console.log(`富途快訊數據已緩存，時間: ${new Date().toLocaleString()}`);
};

/**
 * @description 使用簡單方法抓取富途快訊（Axios直接請求API）
 * @returns {Promise<Object>} 富途快訊數據
 */
const fetchFlashNewsSimple = async () => {
  try {
    console.log(`[${new Date().toLocaleString()}] 使用簡單方法抓取富途快訊...`);

    const deviceId = generateDeviceId();
    
    // 構建請求參數
    const params = {
      pageSize: 30,
      _t: getCurrentTimestamp(),
      device_id: deviceId,
      timezone: 8,
      platform: 'web',
      v: Math.floor(Math.random() * 1000000)
    };
    
    console.log('富途快訊請求參數:', params);
    
    // 發送請求獲取快訊數據
    const response = await futuClient.get('/news-site-api/main/get-flash-list', { 
      params,
      headers: {
        'Cookie': `device_id=${deviceId}`
      }
    });
    
    // 驗證響應
    if (response.status === 200 && response.data && response.data.code === 0) {
      console.log('富途快訊API請求成功 (簡單方法)');
      return response.data;
    } else {
      console.warn('富途快訊API返回無效響應:', response.data);
      throw new Error('富途快訊API返回無效響應');
    }
  } catch (error) {
    console.error('簡單方法抓取富途快訊失敗:', error.message);
    throw error;
  }
};

/**
 * @description 使用高級方法抓取富途快訊（使用Puppeteer模擬瀏覽器）
 * @returns {Promise<Object>} 富途快訊數據
 */
const fetchFlashNewsAdvanced = async () => {
  let browser = null;
  
  try {
    console.log(`[${new Date().toLocaleString()}] 使用高級方法抓取富途快訊（Puppeteer）...`);
    
    // 啟動瀏覽器
    browser = await puppeteer.launch({
      headless: 'new', // 使用新的無頭模式
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    // 創建新頁面
    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 1366, height: 768 });
    
    // 設置User-Agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    
    // 啟用請求攔截
    await page.setRequestInterception(true);
    
    // 存儲API響應
    let apiResponse = null;
    
    // 攔截請求和響應
    page.on('request', request => {
      // 只允許必要的請求類型
      const resourceType = request.resourceType();
      if (['document', 'xhr', 'fetch', 'script'].includes(resourceType)) {
        request.continue();
      } else {
        request.abort();
      }
    });
    
    // 監聽網絡響應
    page.on('response', async response => {
      const url = response.url();
      
      // 檢查是否是目標API
      if (url.includes('/news-site-api/main/get-flash-list')) {
        try {
          // 獲取並解析響應JSON
          const responseText = await response.text();
          apiResponse = JSON.parse(responseText);
          console.log('攔截到富途快訊API響應');
        } catch (error) {
          console.error('解析API響應失敗:', error.message);
        }
      }
    });
    
    // 訪問富途快訊頁面
    console.log('訪問富途快訊頁面...');
    await page.goto('https://news.futunn.com/flash', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // 等待API響應或直接從頁面提取數據
    if (!apiResponse) {
      console.log('未攔截到API響應，嘗試從頁面提取數據...');
      
      // 等待快訊容器加載
      await page.waitForSelector('.flash-item', { timeout: 30000 });
      
      // 從頁面提取HTML
      const html = await page.content();
      const $ = cheerio.load(html);
      
      // 提取快訊數據
      const newsItems = [];
      
      $('.flash-item').each((index, element) => {
        const $el = $(element);
        
        // 提取ID
        const id = $el.attr('id') || `flash-${Date.now()}-${index}`;
        
        // 提取標題和內容
        const title = $el.find('.flash-item-title').text().trim();
        const content = $el.find('.flash-item-content').text().trim();
        
        // 提取時間
        const time = $el.find('.flash-item-time').text().trim();
        const timestamp = Math.floor(Date.now() / 1000); // 使用當前時間作為替代
        
        // 構建新聞項
        newsItems.push({
          id,
          title,
          content,
          time: timestamp,
          source: '富途快訊',
          quote: [] // 暫無股票相關數據
        });
      });
      
      // 構建類似API響應的對象
      apiResponse = {
        code: 0,
        data: {
          data: {
            news: newsItems
          }
        }
      };
      
      console.log(`從頁面提取了 ${newsItems.length} 條快訊`);
    }
    
    return apiResponse;
  } catch (error) {
    console.error('高級方法抓取富途快訊失敗:', error.message);
    throw error;
  } finally {
    // 關閉瀏覽器
    if (browser) {
      await browser.close();
      console.log('瀏覽器已關閉');
    }
  }
};

/**
 * @description 抓取富途快訊（優先使用緩存，然後嘗試簡單方法，最後嘗試高級方法）
 * @returns {Promise<Object>} 富途快訊數據
 */
const fetchFutuFlash = async () => {
  try {
    // 檢查緩存
    const cachedData = getCache();
    if (cachedData) {
      return cachedData;
    }
    
    // 嘗試簡單方法
    try {
      const data = await fetchFlashNewsSimple();
      updateCache(data);
      return data;
    } catch (simpleError) {
      console.warn('簡單方法失敗，嘗試高級方法:', simpleError.message);
      
      // 嘗試高級方法
      const data = await fetchFlashNewsAdvanced();
      updateCache(data);
      return data;
    }
  } catch (error) {
    console.error('抓取富途快訊失敗:', error.message);
    throw error;
  }
};

module.exports = {
  fetchFutuFlash
}; 