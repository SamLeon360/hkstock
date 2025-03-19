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

# 拉取最新代碼（如果是從Git倉庫部署）
# git pull

# 創建logs目錄（如果不存在）
mkdir -p logs

# 構建或重建服務
echo "構建Docker映像..."
docker-compose build

# 停止舊容器
echo "停止舊容器..."
docker-compose down

# 啟動新容器
echo "啟動新容器..."
docker-compose up -d

# 檢查容器狀態
echo "檢查容器狀態..."
docker-compose ps

echo "===== HKStock應用部署完成 ====="
echo "訪問您的應用: http://您的服務器IP:3002" 