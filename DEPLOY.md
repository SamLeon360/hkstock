# 香港股市資訊網站部署指南

本指南介紹如何使用 Docker 和 Docker Compose 部署應用。

## 前提條件

- 安裝 Docker 和 Docker Compose
- 確保伺服器上的 3001 端口可用
- 域名解析已經設置（如果使用自定義域名）

## 部署步驟

### 1. 準備部署環境

確保伺服器上安裝了 Docker 和 Docker Compose：

```bash
# 安裝 Docker (如果未安裝)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安裝 Docker Compose (如果未安裝)
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 獲取項目代碼

```bash
# 克隆代碼庫
git clone <repository_url> hkstock
cd hkstock
```

或者將項目文件直接上傳到服務器。

### 3. 使用腳本部署應用

項目提供了一個方便的腳本來管理應用：

```bash
# 賦予腳本執行權限
chmod +x start.sh

# 構建並啟動應用
./start.sh start

# 查看應用狀態
./start.sh status

# 查看日誌
./start.sh logs
```

或者直接使用 Docker Compose 命令：

```bash
# 構建和啟動
docker-compose up -d

# 重新構建並啟動
docker-compose up -d --build
```

### 4. 檢查部署是否成功

應用現在應該在 http://your-server-ip:3001 上運行。
如果使用了域名，則訪問 http://hkstock.atomtechnology.com.hk:3001

## 常見部署問題解決

### 1. 端口衝突

如果 3001 端口已被佔用，可以修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "其他端口:3001"
```

同時也需要更新 Nginx 配置，以使接口代理正確工作。

### 2. API 數據不顯示

如果網站可以訪問但不顯示 API 數據，可以檢查以下幾點：

- 檢查瀏覽器控制台中是否有 API 請求錯誤
- 確認 `nginx.conf` 中的代理設置正確
- 確保 secret-key 被正確設置在請求頭中
- 暫時禁用瀏覽器擴展，特別是廣告攔截器

可以在容器中檢查 Nginx 日誌來診斷問題：

```bash
# 進入容器
docker exec -it hkstock-app /bin/sh

# 查看 Nginx 日誌
cat /var/log/nginx/error.log
cat /var/log/nginx/access.log
```

### 3. 更新應用

要更新應用到最新版本，可以使用腳本：

```bash
# 拉取最新代碼
git pull

# 重新構建並部署
./start.sh rebuild
```

## 服務器維護

### 備份配置

定期備份重要的配置文件：

```bash
# 備份 Docker Compose 配置
cp docker-compose.yml docker-compose.yml.bak

# 備份 Nginx 配置
cp nginx.conf nginx.conf.bak
```

### 監控容器狀態

可以使用以下命令監控容器狀態：

```bash
# 查看容器狀態
docker stats hkstock-app

# 查看容器日誌
docker logs -f hkstock-app
```

### 容器重啟策略

`docker-compose.yml` 已配置 `restart: unless-stopped` 策略，確保容器在崩潰或系統重啟後自動重啟。

## 使用 SSL 加密 (HTTPS)

要啟用 HTTPS，需要獲取 SSL 證書並修改 Nginx 配置。推薦使用 Certbot 獲取 Let's Encrypt 免費證書：

```bash
# 安裝 Certbot
apt-get update
apt-get install certbot

# 獲取證書
certbot certonly --standalone -d hkstock.atomtechnology.com.hk
```

然後修改 `nginx.conf`，添加 SSL 配置。 