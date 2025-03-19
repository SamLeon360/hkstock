import React from 'react';
import styled from 'styled-components';
import FlashItem from './FlashItem';

/**
 * @description 快訊列表組件，顯示快訊列表
 * @param {Object} props - 組件屬性
 * @param {Array} props.flashList - 快訊數據列表
 * @param {boolean} props.loading - 是否正在加載
 * @returns {JSX.Element} 快訊列表組件
 */
const FlashList = ({ flashList, loading }) => {
  // 如果正在加載，顯示加載狀態
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>正在獲取最新快訊...</LoadingText>
      </LoadingContainer>
    );
  }

  // 如果沒有數據，顯示空狀態
  if (!flashList || flashList.length === 0) {
    return (
      <EmptyContainer>
        <EmptyIcon>📰</EmptyIcon>
        <EmptyText>暫無快訊</EmptyText>
        <EmptySubText>請稍後再試或切換其他分類</EmptySubText>
      </EmptyContainer>
    );
  }

  // 渲染快訊列表
  return (
    <ListContainer>
      {flashList.map((item, index) => (
        <FlashItem key={`${item.id || index}`} item={item} />
      ))}
    </ListContainer>
  );
};

// 樣式組件
const ListContainer = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  
  /* 自定義滾動條 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #666;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const EmptySubText = styled.div`
  font-size: 14px;
  color: #888;
`;

export default FlashList; 