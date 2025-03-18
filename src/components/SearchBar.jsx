import React from 'react';
import styled from 'styled-components';

/**
 * @description 搜尋欄組件
 * @param {Object} props - 組件屬性
 * @param {string} props.searchQuery - 搜尋關鍵詞
 * @param {Function} props.setSearchQuery - 設置搜尋關鍵詞的函數
 * @param {Function} props.onSearch - 搜尋提交時觸發的回調函數
 * @returns {JSX.Element} 搜尋欄組件
 */
const SearchBar = ({ searchQuery, setSearchQuery, onSearch }) => {
  // 處理搜尋輸入變化
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // 處理搜尋表單提交
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim() !== '') {
      onSearch();
    }
  };

  // 清除搜尋
  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <SearchContainer onSubmit={handleSubmit}>
      <SearchIcon>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </SearchIcon>
      <SearchInput
        type="text"
        placeholder="搜尋資訊..."
        value={searchQuery}
        onChange={handleSearchChange}
      />
      {searchQuery && (
        <ClearButton type="button" onClick={handleClear}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </ClearButton>
      )}
      <SearchButton type="submit">搜尋</SearchButton>
    </SearchContainer>
  );
};

// 樣式組件
const SearchContainer = styled.form`
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 0 15px;
  position: relative;
  margin-bottom: 20px;
`;

const SearchIcon = styled.div`
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 15px;
  font-size: 16px;
  
  &::placeholder {
    color: #aaa;
  }
`;

const ClearButton = styled.button`
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  
  &:hover {
    color: #555;
  }
`;

const SearchButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  margin-left: 10px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

export default SearchBar; 