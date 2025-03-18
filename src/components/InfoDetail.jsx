import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DeepseekComment from './DeepseekComment';
import { getNewsAnalysis } from '../services/deepseekAPI';

/**
 * @description 資訊詳情組件，顯示選中資訊的詳細內容
 * @param {Object} props - 組件屬性
 * @param {Object} props.info - 資訊對象
 * @param {Function} props.onBackClick - 返回按鈕點擊回調函數
 * @returns {JSX.Element} 資訊詳情組件
 */
const InfoDetail = ({ info, onBackClick }) => {
  // Deepseek評論相關狀態
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  
  // 監聽 info 變化，當切換文章時重置狀態
  useEffect(() => {
    // 重置 Deepseek 評論相關狀態
    setShowAnalysis(false);
    setAnalysisData(null);
    setStreamText('');
    
    console.log('InfoDetail: 文章已切換，重置評論狀態');
  }, [info?.id]); // 只在文章 ID 變化時觸發
  
  if (!info) {
    return <EmptyState>請選擇一個資訊項查看詳情</EmptyState>;
  }

  // 處理分析按鈕點擊
  const handleAnalysisClick = async () => {
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
        const result = await getNewsAnalysis(info, handleChunk);
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

  // 判斷是否為快訊
  const isFlashNews = info.category?.includes('快訊');
  
  // 格式化標籤，確保標籤總是以字符串數組形式展示
  const formatTags = (tags) => {
    if (!tags) return [];
    
    // 處理各種可能的標籤格式
    return tags.map((tag) => {
      if (typeof tag === 'string') return tag;
      if (typeof tag === 'object') {
        // 如果標籤是一個對象，嘗試使用其id、name或title屬性
        return tag.name || tag.title || tag.id || JSON.stringify(tag);
      }
      return String(tag); // 將其他類型轉換為字符串
    });
  };

  console.log('InfoDetail渲染:', info.id);

  return (
    <DetailContainer>
      <MobileBackButton onClick={onBackClick}>
        <BackIcon>←</BackIcon> 返回列表
      </MobileBackButton>
      
      <DetailHeaderContainer>
        <DetailHeader>
          <DetailTitle>{info.title || '無標題'}</DetailTitle>
          <DetailMeta>
            <DetailCategory>{info.category || '未分類'}</DetailCategory>
            <DetailDate>{info.date || '未知日期'}</DetailDate>
            <DetailSource>{info.source || '未知來源'}</DetailSource>
            {info.views && <DetailViews>瀏覽量: {info.views}</DetailViews>}
          </DetailMeta>
        </DetailHeader>
        <AnalysisButtonContainer>
          <AnalysisButton 
            onClick={handleAnalysisClick}
            $active={showAnalysis}
            $loading={analysisLoading}
            disabled={analysisLoading}
          >
            {analysisLoading ? (
              <>
                <ButtonSpinner />
                AI分析中...
              </>
            ) : 'Deepseek評論'}
          </AnalysisButton>
        </AnalysisButtonContainer>
      </DetailHeaderContainer>
      
      {showAnalysis && (
        <AnalysisPopup $show={showAnalysis}>
          <PopupOverlay onClick={() => setShowAnalysis(false)} />
          <PopupContent>
            <PopupCloseButton onClick={() => setShowAnalysis(false)}>×</PopupCloseButton>
            <DeepseekComment 
              analysis={analysisData} 
              loading={analysisLoading}
              streamText={streamText}
            />
          </PopupContent>
        </AnalysisPopup>
      )}
      
      {info.image && <DetailImage src={info.image} alt={info.title || '新聞圖片'} onError={(e) => {
        e.target.src = 'https://via.placeholder.com/300x200?text=金十財經';
      }} />}
      
      {/* 快訊不顯示摘要，僅顯示在要聞中 */}
      {!isFlashNews && info.description && (
        <DetailSummary>
          <strong>摘要：</strong> {info.description}
        </DetailSummary>
      )}
      
      <DetailContent 
        dangerouslySetInnerHTML={{ 
          __html: info.content || info.description || '暫無詳細內容' 
        }} 
      />
      
      {info.tags && info.tags.length > 0 && (
        <DetailTags>
          <TagsTitle>相關標籤：</TagsTitle>
          <TagsList>
            {formatTags(info.tags).map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagsList>
        </DetailTags>
      )}
      
      {info.related && info.related.length > 0 && (
        <RelatedInfo>
          <RelatedTitle>相關資訊：</RelatedTitle>
          <RelatedList>
            {info.related.map((item, index) => (
              <RelatedItem key={index}>
                <RelatedLink href="#">
                  {typeof item === 'string' ? item : (item.title || '相關新聞')}
                </RelatedLink>
              </RelatedItem>
            ))}
          </RelatedList>
        </RelatedInfo>
      )}
      
      {info.url && (
        <SourceLink>
          <a href={info.url} target="_blank" rel="noopener noreferrer">
            查看原文 →
          </a>
        </SourceLink>
      )}
    </DetailContainer>
  );
};

// 样式组件
const DetailContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  position: relative;
`;

const DetailHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const MobileBackButton = styled.button`
  display: none;
  align-items: center;
  background: none;
  border: none;
  color: #1890ff;
  font-size: 14px;
  padding: 0;
  margin-bottom: 15px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const BackIcon = styled.span`
  margin-right: 5px;
  font-size: 18px;
`;

const DetailHeader = styled.div`
  flex: 1;
`;

const DetailTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 15px 0;
  line-height: 1.3;
  color: #333;
`;

const DetailMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #888;
`;

const DetailCategory = styled.span`
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  color: #555;
`;

const DetailDate = styled.span``;

const DetailSource = styled.span``;

const DetailViews = styled.span``;

const DetailImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const DetailSummary = styled.div`
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  line-height: 1.6;
  font-size: 16px;
  color: #555;
  border-left: 4px solid #ddd;
`;

const DetailContent = styled.div`
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  
  p {
    margin-bottom: 16px;
  }
  
  h2, h3, h4 {
    margin-top: 24px;
    margin-bottom: 16px;
  }
  
  ul, ol {
    margin-bottom: 16px;
    padding-left: 24px;
  }
  
  li {
    margin-bottom: 8px;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 16px 0;
  }
  
  blockquote {
    border-left: 4px solid #ddd;
    padding-left: 16px;
    margin-left: 0;
    color: #666;
  }
  
  code {
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 16px;
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
  
  a {
    color: #1890ff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
    
    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background-color: #f5f5f5;
    }
    
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  }
`;

const DetailTags = styled.div`
  margin-top: 30px;
`;

const TagsTitle = styled.div`
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 2px 10px;
  border-radius: 16px;
  font-size: 13px;
`;

const RelatedInfo = styled.div`
  margin-top: 30px;
`;

const RelatedTitle = styled.div`
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
`;

const RelatedList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const RelatedItem = styled.li`
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RelatedLink = styled.a`
  color: #1890ff;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SourceLink = styled.div`
  margin-top: 30px;
  text-align: right;
  
  a {
    color: #1890ff;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const AnalysisButtonContainer = styled.div`
  margin-left: 15px;
`;

const AnalysisButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${props => props.$active ? '#e74c3c' : '#9b59b6'};
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.$active ? '#c0392b' : '#8e44ad'};
  }
  
  &:disabled {
    opacity: 0.7;
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
  padding: 20px;
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

const PopupCloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
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

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  font-size: 16px;
  padding: 20px;
  text-align: center;
`;

export default InfoDetail; 