import React from 'react';
import styled from 'styled-components';

/**
 * @description Deepseek評論組件，顯示AI分析結果
 * @param {Object} props - 組件屬性
 * @param {Object} props.analysis - 分析結果數據
 * @param {boolean} props.loading - 是否正在加載
 * @param {string} props.streamText - 流式輸出的文本
 * @returns {JSX.Element} Deepseek評論組件
 */
const DeepseekComment = ({ analysis, loading, streamText }) => {
  // 如果沒有分析數據且不在加載狀態，不顯示組件
  if (!analysis && !loading && !streamText) {
    return null;
  }

  return (
    <CommentContainer>
      <CommentHeader>
        <CommentTitle>Deepseek 專業評論</CommentTitle>
        {loading && <LoadingIndicator />}
      </CommentHeader>

      {(loading && !analysis) && (
        streamText ? (
          <StreamContainer dangerouslySetInnerHTML={{ __html: streamText }} />
        ) : (
          <LoadingContainer>
            <LoadingText>AI正在分析新聞內容...</LoadingText>
          </LoadingContainer>
        )
      )}

      {analysis && (
        <>
          <MarketsSection>
            <MarketItem $impact={analysis.a_share?.impact}>
              <MarketLabel>A股影響</MarketLabel>
              <ImpactBadge $impact={analysis.a_share?.impact}>
                {analysis.a_share?.impact || '未知'}
              </ImpactBadge>
              <MarketDescription>
                {analysis.a_share?.description || '暫無分析'}
              </MarketDescription>
            </MarketItem>

            <MarketItem $impact={analysis.hk_share?.impact}>
              <MarketLabel>港股影響</MarketLabel>
              <ImpactBadge $impact={analysis.hk_share?.impact}>
                {analysis.hk_share?.impact || '未知'}
              </ImpactBadge>
              <MarketDescription>
                {analysis.hk_share?.description || '暫無分析'}
              </MarketDescription>
            </MarketItem>

            <MarketItem $impact={analysis.us_share?.impact}>
              <MarketLabel>美股影響</MarketLabel>
              <ImpactBadge $impact={analysis.us_share?.impact}>
                {analysis.us_share?.impact || '未知'}
              </ImpactBadge>
              <MarketDescription>
                {analysis.us_share?.description || '暫無分析'}
              </MarketDescription>
            </MarketItem>
          </MarketsSection>

          {analysis.sectors && analysis.sectors.length > 0 && (
            <SectorsSection>
              <SectionTitle>相關板塊</SectionTitle>
              <TagsContainer>
                {analysis.sectors.map((sector, index) => (
                  <SectorTag key={index}>{sector}</SectorTag>
                ))}
              </TagsContainer>
            </SectorsSection>
          )}

          {analysis.stocks && analysis.stocks.length > 0 && (
            <StocksSection>
              <SectionTitle>推薦股票</SectionTitle>
              <StocksContainer>
                {analysis.stocks.map((stock, index) => (
                  <StockCard key={index}>
                    <StockHeader>
                      <StockName>{stock.name || '未知'}</StockName>
                      <StockCode>{stock.code || '未知'}</StockCode>
                      <StockMarket>{stock.market || '未知'}</StockMarket>
                    </StockHeader>
                    {stock.reason && <StockReason>{stock.reason}</StockReason>}
                  </StockCard>
                ))}
              </StocksContainer>
            </StocksSection>
          )}
        </>
      )}

      <CommentFooter>
        <AIDisclaimer>以上分析由AI生成，僅供參考，不構成投資建議</AIDisclaimer>
      </CommentFooter>
    </CommentContainer>
  );
};

// 樣式組件
const CommentContainer = styled.div`
  padding: 0;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
`;

const CommentTitle = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const StreamContainer = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #666;
`;

const LoadingIndicator = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MarketsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
`;

const getImpactColor = (impact) => {
  if (!impact) return '#888';
  
  switch (impact.toLowerCase()) {
    case '正面':
      return '#27ae60';
    case '負面':
      return '#e74c3c';
    case '中性':
      return '#f39c12';
    default:
      return '#888';
  }
};

const MarketItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid ${props => getImpactColor(props.$impact)};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const MarketLabel = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 10px;
`;

const ImpactBadge = styled.span`
  background-color: ${props => getImpactColor(props.$impact)};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 10px;
`;

const MarketDescription = styled.div`
  font-size: 14px;
  line-height: 1.6;
  margin-top: 10px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #333;
`;

const SectorsSection = styled.div`
  margin-bottom: 25px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SectorTag = styled.span`
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
`;

const StocksSection = styled.div`
  margin-bottom: 25px;
`;

const StocksContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
`;

const StockCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 12px 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const StockHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 100%;
`;

const StockName = styled.div`
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
`;

const StockCode = styled.div`
  color: #1890ff;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
`;

const StockMarket = styled.div`
  background-color: #f0f0f0;
  color: #555;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-top: 2px;
`;

const StockReason = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  margin-top: 10px;
`;

const CommentFooter = styled.div`
  margin-top: 20px;
  padding-top: 15px;
  text-align: center;
  border-top: 1px solid #eee;
`;

const AIDisclaimer = styled.div`
  font-size: 12px;
  color: #888;
  font-style: italic;
`;

export default DeepseekComment;