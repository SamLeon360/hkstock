import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Header from './Header';
import SearchBar from './SearchBar';
import InfoList from './InfoList';
import InfoDetail from './InfoDetail';
import FlashList from './FlashList';
import { fetchFinancialNews, fetchNewsByCategory, searchFinancialNews } from '../services/jin10API';
import { fetchFutuNews, fetchFutuFlash } from '../services/futuAPI';

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
      const needAutoRefresh = ['快訊', '富途要聞', '富途快訊'].includes(activeCategory);
      setAutoRefresh(needAutoRefresh);
      
      if (needAutoRefresh) {
        // 如果需要自動刷新，啟動倒計時
        setCountdown(60);
      } else {
        // 如果不需要自動刷新，清除計時器
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
      
      let newsData;
      
      // 根據分類選擇不同的API
      switch (activeCategory) {
        case '富途要聞':
          newsData = await fetchFutuNews();
          break;
        case '富途快訊':
          newsData = await fetchFutuFlash();
          break;
        default:
          // 獲取其他分類數據
          newsData = await fetchNewsByCategory(activeCategory, apiOptions);
          break;
      }
      
      console.log('API返回數據:', newsData.length, '條記錄');
      
      if (Array.isArray(newsData) && newsData.length > 0) {
        setInfoList(newsData);
        if (!selectedInfo || isFlashCategory()) {
          setSelectedInfo(newsData[0]);
        }
      } else {
        console.warn('API返回空數據或非數組:', newsData);
        const categoryName = getCategoryDisplayName();
        setError(`未找到相關${categoryName}`);
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
      case '富途要聞':
        return '富途要聞';
      case '富途快訊':
        return '富途快訊';
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
    return activeCategory === '富途快訊' || activeCategory === '快訊';
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
            {['快訊', '富途要聞', '富途快訊'].includes(activeCategory) && (
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
        
        {/* 使用 FlashList 組件顯示所有快訊類型 */}
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ControlButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const LanguageToggle = styled.button`
  background-color: #9b59b6;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #8e44ad;
  }
`;

const RefreshButton = styled.button`
  background-color: #27ae60;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #219653;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const AutoRefreshToggle = styled.button`
  background-color: ${props => props.$active ? '#e74c3c' : '#3498db'};
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? '#c0392b' : '#2980b9'};
  }
`;

const CountdownDisplay = styled.div`
  background-color: #34495e;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
`;

const DataSourceLabel = styled.span`
  font-size: 14px;
  color: #666;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  height: calc(100vh - 200px);
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
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

const ListContainer = styled.div`
  flex: 1;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: var(--shadow);
  background-color: white;
  
  @media (max-width: 768px) {
    display: ${props => props.$showOnMobile ? 'block' : 'none'};
  }
`;

const DetailContainer = styled.div`
  flex: 2;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: var(--shadow);
  background-color: white;
  
  @media (max-width: 768px) {
    display: ${props => props.$showOnMobile ? 'block' : 'none'};
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

const ErrorMessage = styled.div`
  background-color: #fff3f3;
  color: #e74c3c;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 10px;
  border-left: 4px solid #e74c3c;
`;

export default App; 