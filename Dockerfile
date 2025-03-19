# 構建階段
FROM node:18 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生產階段
FROM nginx:alpine

# 創建日誌目錄
RUN mkdir -p /var/log/nginx

# 從構建階段複製構建產物
COPY --from=build /app/dist /usr/share/nginx/html

# 將nginx.conf從主機複製到容器
# 注意：這裡不需要複製，因為docker-compose.yml中已經設置了卷映射
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 添加調試腳本
RUN echo '#!/bin/sh\nls -la /usr/share/nginx/html\necho "----------"\ncat /etc/nginx/conf.d/default.conf' > /debug.sh && chmod +x /debug.sh

EXPOSE 3001

# 啟動Nginx
CMD ["nginx", "-g", "daemon off;"] 