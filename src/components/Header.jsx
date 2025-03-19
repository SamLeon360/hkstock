import React from 'react';
import styled from 'styled-components';

/**
 * @description 網站頭部組件
 * @param {Object} props - 組件屬性
 * @param {string} props.activeCategory - 當前選中的分類
 * @param {Function} props.setActiveCategory - 設置當前選中分類的函數
 * @returns {JSX.Element} 頭部組件
 */
const Header = ({ activeCategory, setActiveCategory }) => {
  // 金十數據API兼容的分類
  const categories = [
    '要聞',
    '快訊'
  ];

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>資訊網</Logo>
        <Nav>
          {categories.map((category) => (
            <NavItem 
              key={category} 
              $active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </NavItem>
          ))}
        </Nav>
        <UserActions>
          <LoginButton>登錄</LoginButton>
          <RegisterButton>註冊</RegisterButton>
        </UserActions>
      </HeaderContent>
    </HeaderContainer>
  );
};

// 樣式組件
const HeaderContainer = styled.header`
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px 0;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const NavItem = styled.a`
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? 'var(--primary-color)' : 'inherit'};
  padding-bottom: 2px;
  border-bottom: ${props => props.$active ? '2px solid var(--primary-color)' : 'none'};
  
  &:hover {
    color: var(--primary-color);
  }
`;

const UserActions = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const LoginButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  background-color: white;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
`;

const RegisterButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  background-color: var(--primary-color);
  color: white;
  transition: all 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

export default Header; 