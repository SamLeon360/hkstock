import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Header from './Header';
import SearchBar from './SearchBar';
import InfoList from './InfoList';
import InfoDetail from './InfoDetail';
import FlashList from './FlashList';
import { fetchFinancialNews, fetchNewsByCategory, searchFinancialNews } from '../services/jin10API';

/**
 * @description 主應用組件，包含整個應用的佈局和狀態管理
 * @returns {JSX.Element} 應用組件
 */
const App = () => {
  // 當前選中的分類
  const [activeCategory, setActiveCategory] = useState('要聞');
  // 搜尋關鍵詞
  const [searchQuery, setSearchQuery] = useState('');
  // 資訊列表數據
  const [infoList, setInfoList] = useState([]);
  // 當前選中的資訊項
  const [selectedInfo, setSelectedInfo] = useState(null);
  // 是否在移動裝置上顯示詳情
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);
  // 加載狀態
  const [loading, setLoading] = useState(false);
  // 錯誤訊息
  const [error, setError] = useState(null);
  // 是否已初始化數據
  const [initialized, setInitialized] = useState(false);
  // 當前語言 - 默認繁體中文
  const [language, setLanguage] = useState('traditional');
  // 自動刷新倒計時（針對快訊）
  const [countdown, setCountdown] = useState(60);
  // 是否啟用自動刷新
  const [autoRefresh, setAutoRefresh] = useState(false);
  // 計時器引用
  const timerRef = useRef(null);

  // 初始化數據加載
  useEffect(() => {
    if (!initialized) {
      fetchData();
      setInitialized(true);
    }
  }, [initialized]);

  // 分類變化時重新獲取數據和設置自動刷新
  useEffect(() => {
    if (initialized) {
      fetchData();
      
      // 檢查是否為需要自動刷新的分類
      const needAutoRefresh = ['快訊'].includes(activeCategory);
      setAutoRefresh(needAutoRefresh);
      
      if (needAutoRefresh) {
        // 如果是快訊，啟動倒計時
        setCountdown(60);
      } else {
        // 如果不是快訊，清除計時器
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  }, [activeCategory, language]);

  // 處理自動刷新邏輯
  useEffect(() => {
    if (autoRefresh) {
      // 清除舊的計時器
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // 創建新的計時器
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // 當倒計時為0時，刷新數據
            fetchData();
            return 60; // 重置為60秒
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // 組件卸載時清除計時器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoRefresh]);

  // 搜尋查詢時的處理
  useEffect(() => {
    if (initialized && searchQuery.trim() !== '') {
      handleSearch();
    }
  }, [searchQuery]);

  // 獲取數據的函數
  const fetchData = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 準備API選項
      const apiOptions = {
        language
      };
      
      console.log(`正在獲取分類: ${activeCategory} 的數據`);
      
      // 獲取數據
      const newsData = await fetchNewsByCategory(activeCategory, apiOptions);
      
      console.log('API返回數據:', newsData.length, '條記錄');
      
      if (Array.isArray(newsData) && newsData.length > 0) {
        setInfoList(newsData);
        if (!selectedInfo) {
          setSelectedInfo(newsData[0]);
        }
      } else {
        console.warn('API返回空數據或非數組:', newsData);
        setError(`未找到相關${activeCategory === '快訊' ? '快訊' : '金融新聞'}`);
        setInfoList([]);
      }
    } catch (error) {
      console.error('獲取數據失敗:', error);
      setError('加載數據時出錯，請稍後再試');
      setInfoList([]);
    } finally {
      setLoading(false);
    }
  };
  
  // 獲取分類的顯示名稱
  const getCategoryDisplayName = () => {
    switch (activeCategory) {
      case '快訊':
        return '快訊';
      default:
        return '金融新聞';
    }
  };

  // 處理搜尋
  const handleSearch = async () => {
    if (searchQuery.trim() === '' || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 使用API搜尋
      const results = await searchFinancialNews(searchQuery, { language });
      
      if (Array.isArray(results) && results.length > 0) {
        setInfoList(results);
        setSelectedInfo(results[0]);
      } else {
        setError('未找到相關金融新聞');
        setInfoList([]);
      }
    } catch (error) {
      console.error('搜尋失敗:', error);
      setError('搜尋時出錯，請稍後再試');
      setInfoList([]);
    } finally {
      setLoading(false);
    }
  };

  // 處理資訊項點擊
  const handleInfoClick = (info) => {
    setSelectedInfo(info);
    setShowDetailOnMobile(true);
  };

  // 處理返回列表（移動端）
  const handleBackToList = () => {
    setShowDetailOnMobile(false);
  };

  // 手動刷新數據
  const refreshData = () => {
    fetchData();
    // 如果啟用了自動刷新，重置倒計時
    if (autoRefresh) {
      setCountdown(60);
    }
  };

  // 處理分類變更
  const handleCategoryChange = (category) => {
    if (category !== activeCategory) {
      setActiveCategory(category);
      setSearchQuery('');
    }
  };

  // 處理語言切換
  const toggleLanguage = () => {
    setLanguage(language === 'traditional' ? '' : 'traditional');
    setInfoList([]);
    setSelectedInfo(null);
  };

  // 處理搜尋提交
  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== '') {
      handleSearch();
    }
  };

  // 切換自動刷新功能
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // 檢查是否是快訊分類
  const isFlashCategory = () => {
    return activeCategory === '快訊';
  };

  return (
    <AppContainer>
      <Header 
        activeCategory={activeCategory} 
        setActiveCategory={handleCategoryChange}
      />
      <MainContent>
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onSearch={handleSearchSubmit}
        />
        <ControlsContainer>
          <ControlsGroup>
            <RefreshButton onClick={refreshData} disabled={loading}>
              {loading ? '加載中...' : '刷新數據'}
            </RefreshButton>
            
            {/* 自動刷新選項和倒計時 */}
            {['快訊'].includes(activeCategory) && (
              <>
                <AutoRefreshToggle 
                  $active={autoRefresh} 
                  onClick={toggleAutoRefresh}
                >
                  {autoRefresh ? '關閉自動刷新' : '開啟自動刷新'}
                </AutoRefreshToggle>
                
                {autoRefresh && (
                  <CountdownDisplay>
                    {countdown}秒後自動刷新
                  </CountdownDisplay>
                )}
              </>
            )}
          </ControlsGroup>
        </ControlsContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {/* 使用 FlashList 組件顯示快訊 */}
        {isFlashCategory() ? (
          <FlashListContainer>
            <FlashList 
              flashList={infoList} 
              loading={loading}
            />
          </FlashListContainer>
        ) : (
          /* 其他分類使用標準的InfoList和InfoDetail */
          <ContentContainer>
            <ListContainer $showOnMobile={!showDetailOnMobile}>
              <InfoList 
                infoList={infoList} 
                onInfoClick={handleInfoClick} 
                selectedInfoId={selectedInfo?.id} 
                loading={loading}
              />
            </ListContainer>
            <DetailContainer $showOnMobile={showDetailOnMobile}>
              <InfoDetail 
                info={selectedInfo} 
                onBackClick={handleBackToList}
              />
            </DetailContainer>
          </ContentContainer>
        )}
      </MainContent>
    </AppContainer>
  );
};

// 樣式組件
const AppContainer = styled.div`
  font-family: 'Noto Sans SC', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  flex-grow: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ListContainer = styled.div`
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  height: calc(100vh - 200px);
  overflow: hidden;
  
  @media (max-width: 768px) {
    display: ${props => props.$showOnMobile ? 'block' : 'none'};
    min-height: 500px;
  }
`;

const DetailContainer = styled.div`
  flex: 2;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  height: calc(100vh - 200px);
  overflow: hidden;
  
  @media (max-width: 768px) {
    display: ${props => props.$showOnMobile ? 'block' : 'none'};
    min-height: 500px;
  }
`;

const FlashListContainer = styled.div`
  margin-top: 20px;
  height: calc(100vh - 200px);
  overflow: hidden;
  border-radius: 8px;
  box-shadow: var(--shadow);
  background-color: #f9f9f9;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
`;

const ControlsGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const RefreshButton = styled.button`
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? '0.7' : '1'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.disabled ? '#f0f0f0' : '#e0e0e0'};
  }
`;

const AutoRefreshToggle = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.$active ? 'var(--primary-color)' : '#f0f0f0'};
  color: ${props => props.$active ? 'white' : 'black'};
  border: 1px solid ${props => props.$active ? 'var(--primary-color)' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? '#2980b9' : '#e0e0e0'};
  }
`;

const CountdownDisplay = styled.span`
  font-size: 14px;
  color: #666;
`;

const ErrorMessage = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
`;

export default App; 