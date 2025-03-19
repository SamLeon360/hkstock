/**
 * @description 金十数据API服务
 * @module jin10API
 */
import axios from 'axios';

/**
 * @description 金十数据 API 客户端实例
 * @type {import('axios').AxiosInstance}
 */
const jin10Client = axios.create({
  baseURL: '/jin10',
  timeout: 100000
});

/**
 * @description 从描述中提取标签
 * @param {string} description - 新闻描述文本
 * @returns {string[]} 提取的标签数组
 */
const extractTags = (description) => {
  if (!description) return [];
  
  const keywordList = ['股市', '美股', '中国', '经济', '央行', '利率', '政策', '美元', '人民币', '原油',
     '黄金', '债券', '科技', '银行', '贸易', '投资', '消费', '通胀', '房地产', '制造业'];
   
  return keywordList.filter(keyword => description.includes(keyword));
};

/**
 * @description 生成随机浏览量
 * @returns {number} 随机生成的浏览量
 */
const generateRandomViews = () => {
  return Math.floor(Math.random() * 10000) + 500;
};

/**
 * @description 格式化日期
 * @param {string} dateString - 原始日期字符串
 * @returns {string} 格式化后的日期
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) 
    ? dateString 
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
 * @description 把API响应格式化为应用标准格式
 * @param {Object} item - 原始API响应项
 * @returns {Object} 格式化后的新闻项
 */
const formatNewsItem = (item) => {
  console.log('格式化新闻项:', item.id, item.title);
  
  // 提取标签
  let tags = [];
  if (item.categories && Array.isArray(item.categories)) {
    // 处理categories可能是对象数组的情况
    tags = item.categories.map(cat => {
      if (typeof cat === 'string') return cat;
      return cat.name || '财经';
    });
  }
  if (tags.length === 0) {
    tags = extractTags(item.title || item.content || '');
  }
  
  // 提取图片URL
  let imageUrl = 'https://via.placeholder.com/300x200?text=金十财经';
  if (item.web_thumbs) {
    if (Array.isArray(item.web_thumbs) && item.web_thumbs.length > 0) {
      imageUrl = item.web_thumbs[0];
    } else if (typeof item.web_thumbs === 'string') {
      imageUrl = item.web_thumbs;
    }
  }
  
  // 格式化日期
  const dateTime = item.display_datetime || item.updated_at || item.display_time;
  const formattedDate = dateTime ? formatDate(dateTime) : formatDate(new Date().toISOString());
  
  return {
    id: item.id ? String(item.id) : `jin10-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: item.title || '未提供标题',
    category: '财经',
    date: formattedDate,
    source: '金十财经',
    views: generateRandomViews(),
    description: item.introduction || item.content || item.title || '',
    content: item.content || item.introduction || '',
    image: imageUrl,
    tags: tags.length > 0 ? tags : ['财经', '市场'],
    related: [],
    url: item.id ? `https://www.jin10.com/details/${item.id}.html` : null
  };
};

/**
 * @description 获取财经新闻列表
 * @param {Object} options - 请求选项
 * @param {string} [options.date] - 日期过滤，为空时返回当天数据
 * @param {string} [options.cid] - 分类ID
 * @param {string} [options.filter] - 关键词过滤，包含这组关键词的不会返回
 * @param {string} [options.language] - 语言，默认简体中文，可传入【traditional】转为繁体
 * @returns {Promise<Array>} 新闻列表
 */
const fetchFinancialNews = async (options = {}) => {
  const { cid, date, filter, language } = options;
  
  // 构建有效的参数对象
  const params = {};
  
  // 只添加有效的参数
  if (date && date !== 'undefined') params.date = date;
  if (cid && cid !== 'undefined') params.cid = cid;
  if (filter && filter !== 'undefined') params.filter = filter;
  if (language && language !== 'undefined') params.language = language;
  
  console.log('请求参数:', params);
  
  try {
    const response = await jin10Client.get('/data-api/news', { params });
    console.log('API响应状态:', response.status);
    console.log('API原始响应结构:', JSON.stringify(response.data).substring(0, 200) + '...');
    
    // 处理API返回的数据结构，提取data数组
    if (response.status === 200 && response.data) {
      const newsArray = response.data.data || [];
      
      if (Array.isArray(newsArray) && newsArray.length > 0) {
        console.log(`成功获取 ${newsArray.length} 条新闻`);
        return newsArray.map(formatNewsItem);
      } else {
        console.warn('API返回的data字段为空数组或不存在');
        return [];
      }
    } else {
      console.warn('API返回无效响应:', response.data);
      return [];
    }
  } catch (error) {
    console.error('获取财经新闻失败:', error.message);
    if (error.response) {
      console.error('API错误状态:', error.response.status);
      console.error('API错误数据:', error.response.data);
    }
    throw new Error('获取财经新闻失败');
  }
};

/**
 * @description 获取金十快讯数据
 * @param {Object} options - 请求选项
 * @param {string} [options.category] - 快訊分類ID: 1=市場快訊, 2=期貨快訊, 3=美港快訊, 4=A股快訊, 5=商品外匯快訊
 * @param {string} [options.language] - 语言，默认简体中文，可传入【traditional】转为繁体
 * @returns {Promise<Array>} 快讯列表
 */
const fetchFlashNews = async (options = {}) => {
  const { category, language } = options;
  
  // 构建有效的参数对象
  const params = {};
  
  // 只添加有效的参数
  if (category && category !== 'undefined') params.category = category;
  if (language && language !== 'undefined') params.language = language;
  
  console.log('快訊請求參數:', params);
  
  try {
    const response = await jin10Client.get('/data-api/flash', { params });
    console.log('快訊API響應狀態:', response.status);
    console.log('快訊API原始響應結構:', JSON.stringify(response.data).substring(0, 200) + '...');
    
    // 处理API返回的数据结构，提取data数组
    if (response.status === 200 && response.data) {
      const flashArray = response.data.data || [];
      
      if (Array.isArray(flashArray) && flashArray.length > 0) {
        console.log(`成功獲取 ${flashArray.length} 條快訊`);
        // 格式化并過濾掉返回為null的項目
        const formattedItems = flashArray
          .map(formatFlashItem)
          .filter(item => item !== null);
        
        console.log(`格式化後剩餘 ${formattedItems.length} 條快訊（過濾掉空內容）`);
        return formattedItems;
      } else {
        console.warn('快訊API返回的data字段為空數組或不存在');
        return [];
      }
    } else {
      console.warn('快訊API返回無效響應:', response.data);
      return [];
    }
  } catch (error) {
    console.error('獲取金十快訊失敗:', error.message);
    if (error.response) {
      console.error('API錯誤狀態:', error.response.status);
      console.error('API錯誤數據:', error.response.data);
    }
    throw new Error('獲取金十快訊失敗');
  }
};

/**
 * @description 格式化快訊項目为应用标准格式
 * @param {Object} item - 原始API响应項目
 * @returns {Object} 格式化后的快讯项
 */
const formatFlashItem = (item) => {
  console.log('格式化快訊項目:', item.id);
  
  // 提取内容，兼容两种数据结构
  const content = item.data?.content || item.content || '';
  
  // 如果內容為空，不返回該快訊項
  if (!content || content.trim() === '') {
    return null;
  }
  
  // 提取标签
  let tags = [];
  if (item.remark && Array.isArray(item.remark) && item.remark.length > 0) {
    tags = item.remark;
  } else if (item.qh_tags && Array.isArray(item.qh_tags)) {
    // 處理數字標籤
    tags = item.qh_tags.map(tagId => `標籤${tagId}`);
  } else {
    // 从内容中提取可能的标签
    tags = extractTags(content);
  }
  
  // 提取图片URL
  let imageUrl = null;
  if (item.data?.pic) {
    imageUrl = item.data.pic;
  } else if (item.thumbnails && Array.isArray(item.thumbnails) && item.thumbnails.length > 0) {
    imageUrl = item.thumbnails[0];
  }
  
  // 格式化日期
  const dateTime = item.time || item.created_at;
  const formattedDate = dateTime ? formatDate(dateTime) : formatDate(new Date().toISOString());
  
  // 處理相關股票
  const relatedStocks = [];
  if (item.data && item.data.related_stocks && Array.isArray(item.data.related_stocks)) {
    item.data.related_stocks.forEach(stock => {
      if (stock.name && stock.code) {
        relatedStocks.push({
          name: stock.name,
          code: stock.code,
          market: stock.market || 'SH',
          change: stock.change_ratio || '0%',
          price: stock.price || '0.00',
          url: null // 移除URL
        });
      }
    });
  }
  
  return {
    id: item.id ? `jin10-flash-${item.id}` : `jin10-flash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: content,  // 將內容直接作為標題，在UI中不會單獨顯示
    category: '快訊',
    date: formattedDate,
    source: '金十快訊',
    views: generateRandomViews(),
    description: '',
    content: content,
    image: imageUrl,
    tags: tags.length > 0 ? tags : ['快訊'],
    relatedStocks: relatedStocks,
    url: null, // 移除URL
    // 快訊特有字段
    isFlash: true,
    audioUrls: []
  };
};

/**
 * @description 按分類獲取財經新聞
 * @param {string} category - 分類名稱 
 * @param {Object} options - 其他選項
 * @param {string} [options.language] - 語言，默認簡體中文，可傳入【traditional】轉為繁體
 * @returns {Promise<Array>} 新聞列表
 */
const fetchNewsByCategory = async (category, options = {}) => {
  // 分類映射
  const categoryMap = {
    '要聞': null,  // 原全部分類
    '快訊': '3,4'  // 快訊分類，合併美港快訊(3)和A股快訊(4)
  };
  
  const categoryId = categoryMap[category];
  
  if (category === '要聞') {
    // 要聞使用原有的財經新聞API
    return fetchFinancialNews(options);
  } else if (category === '快訊') {
    // 使用快訊API
    return fetchFlashNews({
      ...options,
      category: categoryId
    });
  } else {
    console.log(`未找到分類 ${category} 的映射，返回要聞`);
    return fetchFinancialNews(options);
  }
};

/**
 * @description 搜索财经新闻
 * @param {string} query - 搜索关键词
 * @param {Object} options - 其他搜索选项
 * @param {string} [options.language] - 语言，默认简体中文，可传入【traditional】转为繁体
 * @returns {Promise<Array>} 搜索结果
 */
const searchFinancialNews = async (query, options = {}) => {
  if (!query || query.trim() === '') {
    return fetchFinancialNews(options);
  }
  
  // 构建有效的参数对象
  const params = {
    contain: query
  };
  
  // 加入其他选项参数
  if (options.language && options.language !== 'undefined') {
    params.language = options.language;
  }
  
  console.log('搜索参数:', params);
  
  try {
    const response = await jin10Client.get('/data-api/news', { params });
    console.log('搜索API响应状态:', response.status);
    
    // 处理API返回的数据结构，提取data数组
    if (response.status === 200 && response.data) {
      const newsArray = response.data.data || [];
      
      if (Array.isArray(newsArray) && newsArray.length > 0) {
        console.log(`搜索成功获取 ${newsArray.length} 条结果`);
        return newsArray.map(formatNewsItem);
      } else {
        console.warn('搜索API返回的data字段为空数组或不存在');
        return [];
      }
    } else {
      console.warn('搜索API返回无效响应:', response.data);
      return [];
    }
  } catch (error) {
    console.error('搜索财经新闻失败:', error.message);
    if (error.response) {
      console.error('API错误状态:', error.response.status);
      console.error('API错误数据:', error.response.data);
    }
    throw new Error('搜索财经新闻失败');
  }
};

export { fetchFinancialNews, fetchNewsByCategory, searchFinancialNews, fetchFlashNews };

export default {
  fetchFinancialNews,
  fetchNewsByCategory,
  searchFinancialNews,
  fetchFlashNews
}; 