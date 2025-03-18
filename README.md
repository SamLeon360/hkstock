# 金十財經資訊平台

這是一個基於 React 的金融資訊平台前端項目，提供要聞和快訊的分類瀏覽、搜索和詳情查看功能。

## 項目特點

- 響應式設計，適配桌面和移動設備
- 分類導航和搜索功能
- 左右兩欄佈局，左側列表，右側詳情
- 使用 styled-components 進行樣式管理
- 模塊化組件結構
- 快訊自動刷新功能
- Deepseek AI 評論分析

## 技術棧

- React 19
- Styled Components
- Webpack 5
- Jin10 API 接入

## 安裝與運行

### 安裝依賴

```bash
npm install
```

### 開發模式運行

```bash
npm start
```

### 構建生產版本

```bash
npm run build
```

### 使用 Docker 部署

```bash
./start.sh rebuild
```

## 項目結構

```
src/
  ├── components/       # React 組件
  │   ├── App.jsx       # 主應用組件
  │   ├── Header.jsx    # 頭部組件
  │   ├── CategoryNav.jsx  # 分類導航組件
  │   ├── SearchBar.jsx    # 搜索欄組件
  │   ├── InfoList.jsx     # 信息列表組件
  │   ├── InfoDetail.jsx   # 信息詳情組件
  │   └── DeepseekComment.jsx # Deepseek AI 評論組件
  ├── services/         # 服務層
  │   ├── jin10API.js   # 金十數據 API
  │   └── deepseekAPI.js # Deepseek API
  ├── styles/           # 樣式文件
  │   └── global.css    # 全局樣式
  └── index.js          # 應用入口
```

## 後續開發計劃

- 添加用戶認證功能
- 實現收藏和分享功能
- 添加評論系統
- 優化性能和加載速度
