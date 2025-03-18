# 信息资讯网站

这是一个基于 React 的信息资讯网站前端项目，提供分类浏览、搜索和详情查看功能。

## 项目特点

- 响应式设计，适配桌面和移动设备
- 分类导航和搜索功能
- 左右两栏布局，左侧列表，右侧详情
- 使用 styled-components 进行样式管理
- 模块化组件结构

## 技术栈

- React 19
- React Router 7
- Styled Components
- Webpack 5

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm start
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
  ├── components/       # React 组件
  │   ├── App.jsx       # 主应用组件
  │   ├── Header.jsx    # 头部组件
  │   ├── CategoryNav.jsx  # 分类导航组件
  │   ├── SearchBar.jsx    # 搜索栏组件
  │   ├── InfoList.jsx     # 信息列表组件
  │   └── InfoDetail.jsx   # 信息详情组件
  ├── data/             # 数据文件
  │   └── mockData.js   # 模拟数据
  ├── styles/           # 样式文件
  │   └── global.css    # 全局样式
  └── index.js          # 应用入口
```

## 后续开发计划

- 接入真实 API 数据
- 添加用户认证功能
- 实现收藏和分享功能
- 添加评论系统
- 优化性能和加载速度 