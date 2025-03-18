/**
 * @description Deepseek API服務
 * @module deepseekAPI
 */
import axios from 'axios';

/**
 * @description Deepseek API客戶端實例
 * @type {import('axios').AxiosInstance}
 */
const deepseekClient = axios.create({
  baseURL: 'https://api.deepseek.com/v1',
  timeout: 60000,
  headers: {
    'Authorization': 'Bearer sk-4f32733f152c4d2bb61c275d405b202f',
    'Content-Type': 'application/json'
  }
});

/**
 * @description Deepseek 可用模型列表
 * @type {Array<string>}
 */
const AVAILABLE_MODELS = [
  'deepseek-chat',
  'deepseek-coder',
  'deepseek-lite',
  'deepseek-instruct'
];

/**
 * @description 生成分析提示詞
 * @param {Object} newsItem - 新聞項目
 * @returns {string} 提示詞
 */
const generatePrompt = (newsItem) => {
  return `
我是一名專業的金融分析師。請我分析以下金融新聞對A股、港股和美股市場的影響。

新聞標題：${newsItem.title}

新聞內容：${newsItem.content || newsItem.description}

請提供以下信息：
1. 這條新聞對A股、港股和美股的影響分析，附帶影響程度（正面/負面）
2. 與這條新聞相關的行業板塊
3. 受這條新聞影響的3-5個具體股票，只需提供股票名稱和代碼（優先選擇港股和美股）

請以JSON格式回答，格式如下：
{
  "a_share": {"impact": "正面/負面/中性", "description": "分析內容..."},
  "hk_share": {"impact": "正面/負面/中性", "description": "分析內容..."},
  "us_share": {"impact": "正面/負面/中性", "description": "分析內容..."},
  "sectors": ["相關板塊1", "相關板塊2", "相關板塊3"],
  "stocks": [
    {"code": "股票代碼1", "name": "股票名稱1", "market": "港股/美股"},
    {"code": "股票代碼2", "name": "股票名稱2", "market": "港股/美股"},
    {"code": "股票代碼3", "name": "股票名稱3", "market": "港股/美股"}
  ]
}
`;
};

/**
 * @description 獲取Deepseek對新聞的分析
 * @param {Object} newsItem - 新聞項目
 * @param {Function} onChunk - 處理流式輸出的回調函數
 * @param {number} [modelIndex=0] - 當前嘗試的模型索引
 * @returns {Promise<Object>} 分析結果
 */
const getNewsAnalysis = async (newsItem, onChunk, modelIndex = 0) => {
  // 如果已經嘗試所有模型，則拋出錯誤
  if (modelIndex >= AVAILABLE_MODELS.length) {
    throw new Error('所有可用模型均無法使用，請檢查API密鑰和網絡連接');
  }

  // 當前嘗試的模型
  const currentModel = AVAILABLE_MODELS[modelIndex];
  console.log(`嘗試使用模型: ${currentModel}`);
  
  try {
    const prompt = generatePrompt(newsItem);
    
    // 顯示載入狀態
    if (onChunk) {
      onChunk('正在請求 Deepseek API...\n');
    }
    
    // 獲取處理完整響應的承諾
    const completeResponsePromise = new Promise((resolve, reject) => {
      // 非流式請求
      deepseekClient.post('/chat/completions', {
        model: currentModel,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        enable_internet: true,  // 啟用聯網功能
        stream: false           // 關閉流式輸出
      }).then(response => {
        try {
          // 非流式響應直接包含完整結果
          if (response.data && response.data.choices && response.data.choices.length > 0) {
            const content = response.data.choices[0].message.content;
            
            // 如果設置了回調函數，也發送完整內容
            if (onChunk) {
              onChunk(content);
            }
            
            // 從內容中提取 JSON
            const jsonResponse = extractJSONFromText(content);
            resolve(jsonResponse);
          } else {
            reject(new Error('API響應格式無效'));
          }
        } catch (err) {
          console.error('處理API響應失敗:', err);
          reject(err);
        }
      }).catch(error => {
        console.error(`使用模型 ${currentModel} 請求失敗:`, error);
        let errorMessage = '獲取分析失敗';
        
        // 提取具體錯誤信息
        if (error.response && error.response.data) {
          console.error('錯誤詳情:', error.response.data);
          try {
            // 嘗試解析錯誤響應
            if (typeof error.response.data === 'string') {
              const errorData = JSON.parse(error.response.data);
              errorMessage = errorData.error?.message || '未知錯誤';
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error.message || '未知錯誤';
            }
          } catch (e) {
            console.error('解析錯誤信息失敗:', e);
          }
        }
        
        // 如果是模型不存在的錯誤，則嘗試下一個模型
        if (
          (errorMessage.includes('Model Not Exist') || errorMessage.includes('invalid_request_error')) &&
          modelIndex < AVAILABLE_MODELS.length - 1
        ) {
          console.log(`模型 ${currentModel} 不可用，嘗試下一個模型...`);
          // 在拒絕前通知用戶
          if (onChunk) {
            onChunk(`\n模型 ${currentModel} 不可用，正在切換到其他模型...\n`);
          }
          resolve(getNewsAnalysis(newsItem, onChunk, modelIndex + 1));
        } else {
          reject(new Error(`Deepseek API錯誤: ${errorMessage}`));
        }
      });
    });
    
    return completeResponsePromise;
  } catch (error) {
    console.error('獲取新聞分析失敗:', error);
    throw error;
  }
};

/**
 * @description 從文本中提取JSON
 * @param {string} text - 包含JSON的文本
 * @returns {Object} 提取的JSON對象
 */
const extractJSONFromText = (text) => {
  try {
    // 嘗試直接解析
    return JSON.parse(text);
  } catch (e) {
    // 尋找JSON開始和結束的位置
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}') + 1;
    
    if (startIndex >= 0 && endIndex > 0) {
      const jsonText = text.substring(startIndex, endIndex);
      try {
        return JSON.parse(jsonText);
      } catch (innerError) {
        console.error('從文本中提取JSON失敗:', innerError);
        throw new Error('無法從回應中提取有效的JSON');
      }
    } else {
      throw new Error('回應中未找到JSON數據');
    }
  }
};

export { getNewsAnalysis };

export default {
  getNewsAnalysis
}; 