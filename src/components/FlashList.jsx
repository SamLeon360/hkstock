import React from 'react';
import styled from 'styled-components';
import FlashItem from './FlashItem';

/**
 * @description 快訊列表組件，顯示富途快訊列表
 * @param {Object} props - 組件屬性
 * @param {Array} props.flashList - 快訊列表數據
 * @param {boolean} props.loading - 是否正在加載數據
 * @returns {JSX.Element} 快訊列表組件
 */
const FlashList = ({ flashList, loading }) => {
  if (loading) {
    return (
      <ListContainer>
        <LoadingState>
          <LoadingSpinner />
          加載中...
        </LoadingState>
      </ListContainer>
    );
  }

  if (!flashList || flashList.length === 0) {
    return (
      <ListContainer>
        <EmptyState>暫無快訊數據</EmptyState>
      </ListContainer>
    );
  }

  // 按照時間對快訊進行分組
  const groupByDate = (flashItems) => {
    const result = {};
    
    flashItems.forEach(item => {
      // 提取日期部分（不含時間）
      const datePart = item.date.split(' ')[0];
      if (!result[datePart]) {
        result[datePart] = [];
      }
      result[datePart].push(item);
    });
    
    return result;
  };
  
  const groupedFlash = groupByDate(flashList);
  const dateGroups = Object.keys(groupedFlash).sort().reverse();

  return (
    <ListContainer>
      <FlashItemsContainer>
        {dateGroups.map(date => (
          <DateGroup key={date}>
            <DateHeader>{date}</DateHeader>
            <TimelineContainer>
              {groupedFlash[date].map((flash) => (
                <TimelineItem key={flash.id}>
                  <TimelineDot />
                  <TimelineContent>
                    <FlashItem flash={flash} />
                  </TimelineContent>
                </TimelineItem>
              ))}
            </TimelineContainer>
          </DateGroup>
        ))}
      </FlashItemsContainer>
    </ListContainer>
  );
};

// 樣式組件
const ListContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 15px;
  background-color: #f9f9f9;
`;

const FlashItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const DateGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateHeader = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
`;

const TimelineContainer = styled.div`
  position: relative;
  padding-left: 20px;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 6px;
    width: 2px;
    background-color: #e0e0e0;
  }
`;

const TimelineItem = styled.div`
  position: relative;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineDot = styled.div`
  position: absolute;
  left: -14px;
  top: 22px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--primary-color);
  z-index: 1;
`;

const TimelineContent = styled.div`
  margin-left: 10px;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 16px;
  color: #888;
  gap: 10px;
`;

const LoadingSpinner = styled.div`
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

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  font-size: 16px;
`;

export default FlashList; 