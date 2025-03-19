# 直接使用Nginx镜像
FROM nginx:alpine

# 創建日誌目錄並設置權限
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/error.log && \
    touch /var/log/nginx/access.log && \
    chmod -R 755 /var/log/nginx

# 複製本地構建好的文件
COPY ./dist /usr/share/nginx/html

# 確保所有靜態文件的權限正確
RUN chmod -R 755 /usr/share/nginx/html

# 添加調試腳本
RUN echo '#!/bin/sh\nls -la /usr/share/nginx/html\necho "----------"\ncat /etc/nginx/conf.d/default.conf\necho "----------"\ncat /var/log/nginx/error.log\necho "----------"\ncat /var/log/nginx/access.log' > /debug.sh && chmod +x /debug.sh

EXPOSE 3001

# 啟動Nginx
CMD ["nginx", "-g", "daemon off;"] 