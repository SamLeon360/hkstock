import React from 'react';
import styled from 'styled-components';

/**
 * @description 資訊列表組件，顯示資訊項列表
 * @param {Object} props - 組件屬性
 * @param {Array} props.infoList - 資訊項列表
 * @param {Object} props.selectedInfo - 當前選中的資訊項
 * @param {Function} props.onInfoClick - 點擊資訊項的回調函數
 * @param {boolean} props.loading - 是否正在加載
 * @returns {JSX.Element} 資訊列表組件
 */
const InfoList = ({ infoList, selectedInfo, onInfoClick, loading }) => {
  if (!Array.isArray(infoList)) {
    console.error('InfoList收到非數組類型的infoList:', infoList);
    return <EmptyState>數據格式錯誤</EmptyState>;
  }
  
  if (infoList.length === 0 && !loading) {
    return <EmptyState>沒有找到匹配的資訊</EmptyState>;
  }

  console.log('InfoList渲染', infoList.length, '條記錄');

  return (
    <ListContainer>
      {infoList.map((info) => {
        if (!info) return null;
        
        return (
          <InfoItem
            key={info.id || `item-${Math.random()}`}
            $isSelected={selectedInfo && selectedInfo.id === info.id}
            onClick={() => onInfoClick(info)}
          >
            <InfoTitle>{info.title || '無標題'}</InfoTitle>
            <InfoDescription>{info.description || '無描述'}</InfoDescription>
            <InfoFooter>
              <InfoMeta>
                <InfoCategory>{info.category || '未分類'}</InfoCategory>
                <InfoDate>{info.date || '未知日期'}</InfoDate>
              </InfoMeta>
              <InfoSource>{info.source || '未知來源'}</InfoSource>
            </InfoFooter>
          </InfoItem>
        );
      })}
      
      {loading && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>加載中...</LoadingText>
        </LoadingContainer>
      )}
    </ListContainer>
  );
};

// 样式组件
const ListContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 10px;
`;

const InfoItem = styled.div`
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.$isSelected ? '#f0f7ff' : 'white'};
  border-left: ${props => props.$isSelected ? '4px solid #1890ff' : '4px solid transparent'};
  
  &:hover {
    background-color: ${props => props.$isSelected ? '#f0f7ff' : '#f9f9f9'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
`;

const InfoDescription = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const InfoFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #888;
`;

const InfoMeta = styled.div`
  display: flex;
  gap: 10px;
`;

const InfoCategory = styled.span`
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
`;

const InfoDate = styled.span``;

const InfoSource = styled.span`
  font-style: italic;
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: #888;
  font-size: 14px;
`;

export default InfoList;

 