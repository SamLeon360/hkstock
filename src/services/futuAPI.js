/**
 * @description 富途要聞API服務
 * @module futuAPI
 */
import axios from 'axios';

/**
 * @description 獲取當前時間戳
 * @returns {number} 當前時間戳（毫秒）
 */
const getCurrentTimestamp = () => {
  return Date.now();
};

/**
 * @description 獲取當前主機URL
 * @returns {string} 當前主機URL
 */
const getBaseUrl = () => {
  // 檢查是否為開發環境或部署環境
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // 開發環境使用相對路徑，原始API請求通過webpack-dev-server代理
    return '';
  } else {
    // 部署環境使用絕對路徑，指向Nginx代理
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}`;
  }
};

/**
 * @description 獲取爬蟲API的基礎URL
 * @returns {string} 爬蟲API基礎URL
 */
const getCrawlerBaseUrl = () => {
  // 檢查是否為開發環境或部署環境
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // 開發環境使用明確的爬蟲服務器地址和端口
    return 'http://localhost:3002';
  } else {
    // 部署環境使用相同的基礎URL
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}`;
  }
};

/**
 * @description 富途要聞 API 客戶端實例
 * @type {import('axios').AxiosInstance}
 */
const futuClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
  }
});

/**
 * @description 爬蟲API客戶端實例 
 * @type {import('axios').AxiosInstance}
 */
const crawlerClient = axios.create({
  baseURL: getCrawlerBaseUrl(),
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
  }
});

/**
 * @description 添加請求和響應攔截器處理CORS和重試
 */
futuClient.interceptors.request.use(
  config => {
    // 記錄請求開始時間，用於計算響應時間
    config.metadata = { startTime: new Date() };
    
    // 確保每次請求都使用最新的時間戳
    if (config.params && config.params._t) {
      config.params._t = getCurrentTimestamp();
    }
    
    // 修改請求路徑，改為使用 /news-site-api/ 直接代理
    if (config.url.startsWith('/futu/news-site-api/')) {
      config.url = config.url.replace('/futu/news-site-api/', '/news-site-api/');
    }
    
    console.log(`API請求: ${config.url}`, config.params);
    return config;
  },
  error => {
    console.error('請求配置錯誤:', error);
    return Promise.reject(error);
  }
);

futuClient.interceptors.response.use(
  response => {
    // 計算響應時間
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`API響應時間: ${duration}ms`);
    
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // 檢查是否存在重試標記和重試次數
    if (!originalRequest._retry && (!originalRequest._retryCount || originalRequest._retryCount < 2)) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // 記錄錯誤
      console.warn(`API請求失敗 (嘗試 ${originalRequest._retryCount}/3): ${originalRequest.url}`);
      console.warn('錯誤詳情:', error.message);
      
      if (error.response) {
        console.warn('錯誤狀態:', error.response.status);
        
        // 針對特定錯誤類型進行處理
        if (error.response.status === 302) {
          console.log('檢測到重定向。嘗試使用直接路徑...');
          
          // 如果是重定向，嘗試直接訪問目標URL
          if (originalRequest.url.includes('/news-site-api/')) {
            // 修復請求URL格式
            originalRequest.url = '/news-site-api/' + originalRequest.url.split('/news-site-api/')[1];
            console.log(`重新構建請求路徑: ${originalRequest.url}`);
          }
        } else if (error.response.status === 0 || error.response.status === 'Network Error' || error.message.includes('Network Error')) {
          // 網絡錯誤，可能是CORS問題
          console.log('檢測到網絡錯誤，可能是CORS問題。嘗試使用直接代理路徑...');
          
          // 改用直接代理路徑
          if (originalRequest.url.includes('/futu/')) {
            originalRequest.url = originalRequest.url.replace('/futu/', '/');
            console.log(`嘗試使用直接代理路徑: ${originalRequest.url}`);
          }
          
          // 等待一秒再重試
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // 更新時間戳，確保不使用緩存
      if (originalRequest.params) {
        originalRequest.params._t = getCurrentTimestamp();
      }
      
      // 重試請求
      console.log(`重試請求: ${originalRequest.url}`);
      return futuClient(originalRequest);
    }
    
    console.error('API請求最終失敗:', error.message);
    return Promise.reject(error);
  }
);

/**
 * @description 從描述中提取標籤
 * @param {string} description - 新聞描述文本
 * @returns {string[]} 提取的標籤數組
 */
const extractTags = (description) => {
  if (!description) return [];
  
  const keywordList = ['股市', '美股', '中國', '經濟', '央行', '利率', '政策', '美元', '人民幣', '原油',
     '黃金', '債券', '科技', '銀行', '貿易', '投資', '消費', '通脹', '房地產', '製造業'];
   
  return keywordList.filter(keyword => description.includes(keyword));
};

/**
 * @description 生成隨機瀏覽量
 * @returns {number} 隨機生成的瀏覽量
 */
const generateRandomViews = () => {
  return Math.floor(Math.random() * 10000) + 500;
};

/**
 * @description 格式化日期
 * @param {string|number} timestamp - 原始時間戳（秒）
 * @returns {string} 格式化後的日期
 */
const formatDate = (timestamp) => {
  if (!timestamp) return '未知日期';
  
  // 將秒轉換為毫秒
  const date = new Date(Number(timestamp) * 1000);
  return isNaN(date.getTime()) 
    ? '未知日期' 
    : date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
};

/**
 * @description 生成随机设备ID
 * @returns {string} 随机生成的设备ID
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
 * @description 格式化富途要聞為應用標準格式
 * @param {Object} item - 原始API響應項
 * @returns {Object} 格式化後的新聞項
 */
const formatFutuNewsItem = (item) => {
  console.log('格式化富途要聞項目:', item.newsId, item.title);
  
  // 提取標籤 (從標題中提取)
  const tags = extractTags(item.title || '');
  
  // 提取圖片URL
  let imageUrl = 'https://via.placeholder.com/300x200?text=富途要聞';
  if (item.pic) {
    imageUrl = item.pic;
  }
  
  // 格式化日期
  const formattedDate = item.timestamp ? formatDate(item.timestamp) : '未知日期';
  
  return {
    id: item.newsId ? `futu-${item.newsId}` : `futu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: item.title || '未提供標題',
    category: '富途要聞',
    date: formattedDate,
    source: item.source || '富途要聞',
    views: generateRandomViews(),
    description: item.abstract || item.title || '',
    content: `<p>${item.title || ''}</p>`,
    image: imageUrl,
    tags: tags.length > 0 ? tags : ['股市', '要聞'],
    related: [],
    url: item.url || null
  };
};

/**
 * @description 格式化富途快訊為應用標準格式
 * @param {Object} item - 原始API響應項
 * @returns {Object} 格式化後的快訊項
 */
const formatFutuFlashItem = (item) => {
  console.log('格式化富途快訊項目:', item.id, item.title);
  
  // 提取標籤 (從內容中提取)
  const tags = extractTags(item.content || '');
  
  // 提取相關股票
  let relatedStocks = [];
  if (item.quote && Array.isArray(item.quote) && item.quote.length > 0) {
    relatedStocks = item.quote.map(stock => ({
      code: stock.code,
      name: stock.name,
      market: stock.stockMarket?.toUpperCase() || '',
      change: stock.changeRatio,
      price: stock.price,
      url: null // 移除URL
    }));
  }
  
  // 格式化日期
  const formattedDate = item.time ? formatDate(item.time) : '未知日期';
  
  return {
    id: item.id ? `futu-flash-${item.id}` : `futu-flash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: item.title || '未提供標題',
    category: '富途快訊',
    date: formattedDate,
    source: '富途快訊',
    views: generateRandomViews(),
    description: '',
    content: item.content || '',
    image: item.pic || null,
    tags: tags.length > 0 ? tags : ['快訊'],
    relatedStocks: relatedStocks,
    url: null, // 移除URL
    // 快訊特有字段
    isFlash: true,
    audioUrls: item.audioInfos?.map(audio => ({
      language: audio.language,
      url: audio.audioUrl,
      duration: audio.audioDuration
    })) || []
  };
};

/**
 * @description 獲取富途要聞列表
 * @returns {Promise<Array>} 新聞列表
 */
const fetchFutuNews = async () => {
  try {
    // 生成設備ID - 每個會話保持一致
    const deviceId = sessionStorage.getItem('futu_device_id') || generateDeviceId();
    sessionStorage.setItem('futu_device_id', deviceId);
    
    // 構建請求參數
    const params = {
      size: 48,
      isSupportWebp: true,
      _t: getCurrentTimestamp(),
      device_id: deviceId,
      timezone: 8,
      platform: 'web',
      v: Math.floor(Math.random() * 1000000),
      markets: 'hk',
      lang: 'zh-CN'
    };
    
    console.log('富途要聞請求參數:', params);
    
    // 使用直接代理路徑
    const response = await futuClient.get('/news-site-api/main/get-market-list', { params });
    console.log('富途API響應狀態:', response.status);
    console.log('富途API響應數據類型:', typeof response.data);
    
    // 處理API返回的數據結構
    if (response.status === 200 && response.data && typeof response.data === 'object' && response.data.code === 0) {
      const newsArray = response.data.data?.list || [];
      
      if (Array.isArray(newsArray) && newsArray.length > 0) {
        console.log(`成功獲取 ${newsArray.length} 條富途要聞`);
        return newsArray.map(formatFutuNewsItem);
      } else {
        console.warn('富途API返回的list字段為空數組或不存在');
        return [];
      }
    } else {
      console.warn('富途API返回無效響應:', response.data);
      return [];
    }
  } catch (error) {
    console.error('獲取富途要聞失敗:', error.message);
    if (error.response) {
      console.error('API錯誤狀態:', error.response.status);
      console.error('API錯誤數據:', error.response.data);
    }
    throw new Error('獲取富途要聞失敗');
  }
};

/**
 * @description 獲取富途快訊列表 - 使用爬蟲API
 * @returns {Promise<Array>} 快訊列表
 */
const fetchFutuFlash = async () => {
  try {
    console.log('開始使用爬蟲API獲取富途快訊...');
    
    // 使用爬蟲API獲取富途快訊
    const response = await crawlerClient.get('/api/futu/flash');
    
    // 檢查響應狀態和數據格式
    if (response.status === 200 && response.data && typeof response.data === 'object' && response.data.code === 0) {
      // 提取快訊數據
      const newsArray = response.data.data?.data?.news || [];
      
      if (Array.isArray(newsArray) && newsArray.length > 0) {
        console.log(`成功獲取 ${newsArray.length} 條富途快訊（爬蟲API）`);
        
        // 格式化並過濾掉空內容的項目
        const formattedItems = newsArray
          .map(formatFutuFlashItem)
          .filter(item => item !== null && item.content && item.content.trim() !== '');
        
        console.log(`格式化後剩餘 ${formattedItems.length} 條富途快訊（過濾掉空內容）`);
        return formattedItems;
      } else {
        console.warn('爬蟲API返回的news字段為空數組或不存在');
        
        // 嘗試使用原方式獲取
        return await fetchFutuFlashOriginal();
      }
    } else {
      console.warn('爬蟲API返回無效響應:', response.data);
      
      // 嘗試使用原方式獲取
      return await fetchFutuFlashOriginal();
    }
  } catch (error) {
    console.error('使用爬蟲API獲取富途快訊失敗:', error.message);
    
    // 顯示錯誤詳情
    if (error.response) {
      console.error('錯誤狀態:', error.response.status);
      console.error('錯誤數據:', error.response.data);
    }
    
    // 嘗試使用原方式獲取
    console.log('嘗試使用原方式獲取富途快訊...');
    return await fetchFutuFlashOriginal();
  }
};

/**
 * @description 原始方式獲取富途快訊列表 - 備用方案
 * @returns {Promise<Array>} 快訊列表
 */
const fetchFutuFlashOriginal = async () => {
  try {
    // 生成設備ID - 每個會話保持一致
    const deviceId = sessionStorage.getItem('futu_device_id') || generateDeviceId();
    sessionStorage.setItem('futu_device_id', deviceId);
    
    // 構建請求參數
    const params = {
      pageSize: 30,
      _t: getCurrentTimestamp(),
      device_id: deviceId,
      timezone: 8,
      platform: 'web',
      v: Math.floor(Math.random() * 1000000)
    };
    
    console.log('富途快訊請求參數 (原方式):', params);
    
    // 使用直接代理路徑
    const response = await futuClient.get('/news-site-api/main/get-flash-list', { params });
    console.log('富途快訊API響應狀態 (原方式):', response.status);
    console.log('富途快訊API響應數據類型 (原方式):', typeof response.data);
    
    // 處理API返回的數據結構
    if (response.status === 200 && response.data && typeof response.data === 'object' && response.data.code === 0) {
      const newsArray = response.data.data?.data?.news || [];
      
      if (Array.isArray(newsArray) && newsArray.length > 0) {
        console.log(`成功獲取 ${newsArray.length} 條富途快訊 (原方式)`);
        
        // 格式化並過濾掉空內容的項目
        const formattedItems = newsArray
          .map(formatFutuFlashItem)
          .filter(item => item !== null && item.content && item.content.trim() !== '');
        
        console.log(`格式化後剩餘 ${formattedItems.length} 條富途快訊（過濾掉空內容）`);
        return formattedItems;
      } else {
        console.warn('富途快訊API返回的news字段為空數組或不存在');
        return [];
      }
    } else {
      console.warn('富途快訊API返回無效響應:', response.data);
      return [];
    }
  } catch (error) {
    console.error('獲取富途快訊失敗 (原方式):', error.message);
    if (error.response) {
      console.error('API錯誤狀態:', error.response.status);
      console.error('API錯誤數據:', error.response.data);
    }
    throw new Error('獲取富途快訊失敗');
  }
};

export { fetchFutuNews, fetchFutuFlash };

export default {
  fetchFutuNews,
  fetchFutuFlash
}; 