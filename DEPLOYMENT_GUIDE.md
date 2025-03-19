# HKStock 部署指南

## 問題診斷和解決方案

之前的部署存在問題，顯示為 Nginx 配置錯誤，但我們的項目應該是 Node.js 應用。以下步驟將解決這個問題。

## 部署步驟

### 1. 備份並移除 nginx.conf 文件

```bash
# 備份 nginx.conf 文件，避免與 Node.js 部署衝突
mv nginx.conf nginx.conf.bak
```

### 2. 確保 docker-compose.yml 配置正確

確認 docker-compose.yml 文件內容如下：

```yaml
version: '3'

services:
  # 爬蟲服務和前端應用
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hkstock-app
    image: hkstock-app:latest
    ports:
      - "3002:3002"
    restart: always
    volumes:
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
```

### 3. 重新構建並啟動服務

```bash
# 停止並移除所有與項目相關的容器
docker-compose down

# 移除舊鏡像
docker rmi hkstock-hkstock-app:latest

# 重新構建鏡像
docker-compose build

# 啟動服務
docker-compose up -d

# 檢查容器狀態
docker-compose ps

# 查看日誌確認服務啟動正常
docker logs -f hkstock-app
```

### 4. 檢查服務是否正常運行

```bash
# 檢查容器狀態
docker ps | grep hkstock

# 檢查服務日誌
docker logs hkstock-app
```

### 5. 測試API訪問

訪問以下URL測試服務是否正常：

```
http://你的服務器IP:3002/api/futu/flash
```

### 6. 故障排除

如果仍然出現問題：

1. 檢查 docker logs 以獲取詳細錯誤信息：
   ```bash
   docker logs -f hkstock-app
   ```

2. 檢查網絡配置：
   ```bash
   # 確認端口 3002 是否正常監聽
   netstat -tulpn | grep 3002
   ```

3. 檢查防火牆設置：
   ```bash
   # 確認端口 3002 是否開放
   firewall-cmd --list-ports
   
   # 如果沒有開放，可以使用以下命令開放
   firewall-cmd --zone=public --add-port=3002/tcp --permanent
   firewall-cmd --reload
   ``` 