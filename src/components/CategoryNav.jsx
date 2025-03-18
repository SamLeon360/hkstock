import React from 'react';
import styled from 'styled-components';

/**
 * @description 分類導航組件，顯示資訊分類並允許用戶選擇
 * @param {string} activeCategory - 當前選中的分類
 * @param {Function} setActiveCategory - 設置當前選中分類的函數
 * @returns {JSX.Element} 分類導航組件
 */
const CategoryNav = ({ activeCategory, setActiveCategory }) => {
  // 金十數據API兼容的分類
  const categories = [
    '要聞',
    '快訊'
  ];

  return (
    <NavContainer>
      {categories.map((category) => (
        <CategoryItem
          key={category}
          $active={activeCategory === category}
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </CategoryItem>
      ))}
    </NavContainer>
  );
};

// 樣式組件
const NavContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 0;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryItem = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? 'white' : '#333'};
  background-color: ${props => props.$active ? '#1890ff' : '#f0f0f0'};
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? '#1890ff' : '#e0e0e0'};
  }
`;

export default CategoryNav; 