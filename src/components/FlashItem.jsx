import React, { useState } from 'react';
import styled from 'styled-components';
import { getNewsAnalysis } from '../services/deepseekAPI';
import DeepseekComment from './DeepseekComment';

/**
 * @description 快訊項目組件，直接顯示完整的快訊內容
 * @param {Object} props - 組件屬性
 * @param {Object} props.flash - 快訊對象
 * @returns {JSX.Element} 快訊項目組件
 */
const FlashItem = ({ flash }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  
  if (!flash) return null;
  
  // 如果內容為空字符串，不顯示該快訊項
  if (!flash.content || flash.content.trim() === '') return null;

  // 處理分析按鈕點擊
  const handleAnalysisClick = async (e) => {
    e.stopPropagation(); // 防止事件冒泡
    
    if (analysisLoading) return;
    
    if (showAnalysis && analysisData) {
      // 如果已經顯示分析並且有數據，則隱藏分析
      setShowAnalysis(false);
      return;
    }
    
    setShowAnalysis(true);
    
    if (!analysisData) {
      // 如果沒有分析數據，則獲取分析
      setAnalysisLoading(true);
      setStreamText('');
      
      try {
        // 定義處理流式輸出的回調函數
        const handleChunk = (chunk) => {
          setStreamText(prevText => {
            const newText = prevText + chunk;
            // 將純文本轉換為HTML格式的文本，保留換行
            return newText.replace(/\n/g, '<br/>');
          });
        };
        
        // 獲取分析結果
        const result = await getNewsAnalysis(flash, handleChunk);
        setAnalysisData(result);
      } catch (error) {
        console.error('獲取Deepseek分析失敗:', error);
        // 友好地顯示錯誤信息
        setStreamText(prevText => {
          const errorMessage = error.message || '獲取分析時出錯，請稍後再試。';
          return `<span style="color: #e74c3c;">${errorMessage}</span><br/><br/>請檢查網絡連接或API密鑰是否有效，或稍後再試。`;
        });
      } finally {
        setAnalysisLoading(false);
      }
    }
  };
  
  // 渲染相關股票
  const renderRelatedStocks = () => {
    if (!flash.relatedStocks || flash.relatedStocks.length === 0) return null;
    
    return (
      <RelatedStocksContainer>
        <RelatedStocksHeader>相關股票：</RelatedStocksHeader>
        <StocksList>
          {flash.relatedStocks.map((stock, index) => (
            <StockItem key={index}>
              <StockName>{stock.name}</StockName>
              <StockCode>{stock.code}</StockCode>
              <StockPrice $change={parseFloat(stock.change)}>
                {stock.price} <ChangeRatio>{stock.change}</ChangeRatio>
              </StockPrice>
            </StockItem>
          ))}
        </StocksList>
      </RelatedStocksContainer>
    );
  };

  // 判斷是否顯示標題
  const shouldShowTitle = () => {
    // 如果沒有標題，或者標題是"未提供標題"，或者標題與內容相同，則不顯示標題
    return flash.title && 
           flash.title !== '未提供標題' && 
           flash.title !== flash.content;
  };

  return (
    <FlashItemContainer>
      <FlashHeader>
        <FlashDate>{flash.date}</FlashDate>
        <AIButton onClick={handleAnalysisClick} $active={showAnalysis} $loading={analysisLoading}>
          {analysisLoading ? <ButtonSpinner /> : <AIIcon />}
        </AIButton>
      </FlashHeader>
      
      {/* 只在特定條件下顯示標題 */}
      {shouldShowTitle() && (
        <FlashTitle>{flash.title}</FlashTitle>
      )}
      
      <FlashContent dangerouslySetInnerHTML={{ __html: flash.content }} />
      
      {renderRelatedStocks()}
      
      {/* 分析彈窗 */}
      {showAnalysis && (
        <AnalysisPopup $show={showAnalysis}>
          <PopupOverlay onClick={() => setShowAnalysis(false)} />
          <PopupContent>
            <PopupCloseButton onClick={() => setShowAnalysis(false)}>×</PopupCloseButton>
            <PopupTitle>{shouldShowTitle() ? flash.title : flash.content}</PopupTitle>
            <DeepseekComment 
              analysis={analysisData} 
              loading={analysisLoading}
              streamText={streamText}
            />
          </PopupContent>
        </AnalysisPopup>
      )}
    </FlashItemContainer>
  );
};

// 樣式組件
const FlashItemContainer = styled.div`
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
  position: relative;
`;

const FlashHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const FlashDate = styled.span`
  font-size: 12px;
  color: #888;
`;

const AIButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.$active ? '#e74c3c' : '#9b59b6'};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? '#c0392b' : '#8e44ad'};
  }
`;

const AIIcon = styled.div`
  font-size: 16px;
  &:before {
    content: "AI";
    font-weight: bold;
    font-style: normal;
  }
`;

const ButtonSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FlashTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px 0;
  line-height: 1.4;
  color: #333;
`;

const FlashContent = styled.div`
  font-size: 15px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 10px;
  
  /* 強調關鍵數字 */
  b, strong {
    font-weight: 600;
    color: #333;
  }
  
  /* 數字樣式 */
  span[style*="color"] {
    font-weight: 600;
  }
`;

const RelatedStocksContainer = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
`;

const RelatedStocksHeader = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px;
`;

const StocksList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
`;

const StockItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  min-width: 110px;
`;

const StockName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const StockCode = styled.div`
  font-size: 12px;
  color: #1890ff;
  margin-top: 2px;
`;

const StockPrice = styled.div`
  margin-top: 5px;
  font-weight: 600;
  font-size: 13px;
  /* 修改顏色邏輯：綠色表示上漲（正值），紅色表示下跌（負值） */
  color: ${props => props.$change > 0 ? '#27ae60' : props.$change < 0 ? '#e74c3c' : '#666'};
`;

const ChangeRatio = styled.span`
  font-size: 12px;
`;

const AnalysisPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${props => props.$show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${props => props.$show ? 'fadeIn 0.3s ease' : 'none'};
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const PopupOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

const PopupContent = styled.div`
  position: relative;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  z-index: 2;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const PopupTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
`;

const PopupCloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

export default FlashItem; 