# 使用Node.js官方鏡像作為基礎鏡像
FROM node:20-alpine

# 設置工作目錄
WORKDIR /app

# 複製package.json和package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製所有文件
COPY . .

# 構建前端應用
RUN npm run build

# 暴露端口
EXPOSE 3002

# 啟動爬蟲服務器
CMD ["node", "server/server.js"] 