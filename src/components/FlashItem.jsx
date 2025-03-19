import React, { useState } from 'react';
import styled from 'styled-components';
import DeepseekComment from './DeepseekComment';
import { getNewsAnalysis } from '../services/deepseekAPI';

/**
 * @description 單個快訊項組件，直接顯示全部內容，右上角有Deepseek評論按鈕
 * @param {Object} props - 組件屬性
 * @param {Object} props.item - 快訊項數據
 * @returns {JSX.Element} FlashItem組件
 */
const FlashItem = ({ item }) => {
  // 是否顯示AI分析
  const [showAnalysis, setShowAnalysis] = useState(false);
  // AI分析結果
  const [analysis, setAnalysis] = useState(null);
  // 分析加載狀態
  const [analysisLoading, setAnalysisLoading] = useState(false);
  // 流式輸出的文本
  const [streamText, setStreamText] = useState('');

  /**
   * @description 處理AI分析按鈕點擊
   */
  const handleAnalysisClick = async () => {
    // 切換顯示狀態
    setShowAnalysis(prev => !prev);
    
    // 如果已經有分析結果且正在顯示，則只需切換顯示狀態
    if (analysis && !showAnalysis) {
      return;
    }
    
    // 如果正在加載或已經有分析結果，則直接返回
    if (analysisLoading || analysis) {
      return;
    }
    
    // 開始獲取分析
    setAnalysisLoading(true);
    setStreamText('');
    
    try {
      // 定義處理流式輸出的回調函數
      const handleStreamResponse = (chunk) => {
        setStreamText(prev => prev + chunk);
      };
      
      // 調用API獲取分析結果
      const result = await getNewsAnalysis(item, handleStreamResponse);
      setAnalysis(result);
    } catch (error) {
      console.error('獲取AI分析失敗:', error);
      setStreamText(`獲取分析失敗: ${error.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 如果沒有項目數據，不渲染任何內容
  if (!item) return null;

  // 確保內容是字符串，如果是對象則轉換為字符串
  const renderContent = () => {
    if (!item.content) return '';
    
    if (typeof item.content === 'object') {
      // 如果內容是對象，嘗試提取有用信息並格式化為字符串
      try {
        return JSON.stringify(item.content);
      } catch (e) {
        console.error('無法渲染內容對象:', e);
        return '無法顯示內容';
      }
    }
    
    return item.content;
  };

  return (
    <ItemContainer>
      <ItemHeader>
        <DateTimeLabel>{item.datetime || '無日期信息'}</DateTimeLabel>
        <AIButton onClick={handleAnalysisClick}>
          <AIText>AI</AIText>
        </AIButton>
      </ItemHeader>
      
      <ItemContent>
        <Content $important={item.important}>{renderContent()}</Content>
        
        {/* 顯示標籤 - 確保標籤是數組且每個項目是字符串 */}
        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
          <TagsContainer>
            {item.tags.map((tag, index) => (
              <Tag key={index}>{typeof tag === 'object' ? JSON.stringify(tag) : String(tag)}</Tag>
            ))}
          </TagsContainer>
        )}
        
        {/* 顯示相關股票 - 確保相關股票是數組且每個項目有有效的屬性 */}
        {item.related_stocks && Array.isArray(item.related_stocks) && item.related_stocks.length > 0 && (
          <RelatedStocksContainer>
            <RelatedStocksLabel>相關股票:</RelatedStocksLabel>
            {item.related_stocks.map((stock, index) => (
              <StockBadge key={index}>
                {(stock.name || '未知股票')} {stock.code ? `(${stock.code})` : ''}
              </StockBadge>
            ))}
          </RelatedStocksContainer>
        )}
      </ItemContent>
      
      {/* 分析彈窗 */}
      {showAnalysis && (
        <AnalysisPopup>
          <AnalysisHeader>
            <AnalysisTitle>AI分析</AnalysisTitle>
            <CloseButton onClick={() => setShowAnalysis(false)}>×</CloseButton>
          </AnalysisHeader>
          <AnalysisContent>
            <DeepseekComment 
              analysis={analysis} 
              loading={analysisLoading} 
              streamText={streamText} 
            />
          </AnalysisContent>
        </AnalysisPopup>
      )}
    </ItemContainer>
  );
};

// 樣式組件
const ItemContainer = styled.div`
  position: relative;
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease-in-out;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
`;

const DateTimeLabel = styled.div`
  color: #888;
  font-size: 13px;
`;

const AIButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
  
  &:hover {
    background-color: #2980b9;
    transform: scale(1.1);
  }
`;

const AIText = styled.span`
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
`;

const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Content = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.$important ? '#e74c3c' : '#333'};
  white-space: pre-wrap;
  word-break: break-word;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Tag = styled.span`
  background-color: #f0f0f0;
  color: #555;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
`;

const RelatedStocksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
`;

const RelatedStocksLabel = styled.span`
  font-size: 13px;
  color: #666;
  font-weight: 500;
`;

const StockBadge = styled.span`
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const AnalysisPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const AnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
`;

const AnalysisTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #888;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: #333;
  }
`;

const AnalysisContent = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 60px);
`;

export default FlashItem; 