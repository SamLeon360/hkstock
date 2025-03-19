#!/bin/bash

echo "===== 開始部署HKStock應用 ====="

# 檢查Docker是否安裝
if ! [ -x "$(command -v docker)" ]; then
  echo "錯誤: Docker未安裝。請先安裝Docker。" >&2
  echo "安裝說明: https://docs.docker.com/get-docker/" >&2
  exit 1
fi

# 檢查Docker Compose是否安裝
if ! [ -x "$(command -v docker-compose)" ]; then
  echo "錯誤: Docker Compose未安裝。請先安裝Docker Compose。" >&2
  echo "安裝說明: https://docs.docker.com/compose/install/" >&2
  exit 1
fi

# 備份並移除nginx.conf以避免與Node.js容器衝突
if [ -f "nginx.conf" ]; then
  echo "發現nginx.conf文件，備份並移除..."
  mv nginx.conf nginx.conf.bak
  echo "nginx.conf已備份為nginx.conf.bak"
fi

# 創建logs目錄（如果不存在）
mkdir -p logs
echo "確保logs目錄存在..."

# 停止並移除現有容器
echo "停止並移除現有容器..."
docker-compose down

# 移除舊鏡像（如果存在）
if docker images | grep -q "hkstock-hkstock-app"; then
  echo "移除舊鏡像 hkstock-hkstock-app..."
  docker rmi hkstock-hkstock-app:latest || true
fi

# 構建或重建服務
echo "構建Docker映像..."
docker-compose build

# 啟動新容器
echo "啟動新容器..."
docker-compose up -d

# 等待容器啟動
echo "等待容器啟動..."
sleep 5

# 檢查容器狀態
echo "檢查容器狀態..."
docker-compose ps

# 檢查日誌以確認啟動情況
echo "檢查日誌..."
docker logs hkstock-app | tail -n 20

echo "===== HKStock應用部署完成 ====="
echo "訪問您的應用: http://您的服務器IP:3002"
echo "檢查API: http://您的服務器IP:3002/api/futu/flash"
echo "查看詳細日誌: docker logs -f hkstock-app" 