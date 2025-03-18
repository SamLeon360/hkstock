#!/bin/bash

# 顯示幫助信息
show_help() {
  echo "香港股市資訊網站管理腳本"
  echo ""
  echo "用法: ./start.sh [命令]"
  echo ""
  echo "可用命令:"
  echo "  start       構建並啟動應用 (後台運行)"
  echo "  stop        停止應用"
  echo "  restart     重新啟動應用"
  echo "  logs        查看應用日誌"
  echo "  rebuild     重新構建並啟動應用"
  echo "  status      查看應用狀態"
  echo "  help        顯示此幫助信息"
  echo ""
}

# 檢查 Docker 和 Docker Compose 是否已安裝
check_requirements() {
  if ! command -v docker &> /dev/null; then
    echo "錯誤: Docker 未安裝"
    exit 1
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    echo "錯誤: Docker Compose 未安裝"
    exit 1
  fi
}

# 主函數
main() {
  check_requirements
  
  case "$1" in
    start)
      echo "構建並啟動應用..."
      docker-compose up -d
      ;;
    stop)
      echo "停止應用..."
      docker-compose down
      ;;
    restart)
      echo "重新啟動應用..."
      docker-compose restart
      ;;
    logs)
      echo "顯示應用日誌..."
      docker-compose logs -f
      ;;
    rebuild)
      echo "重新構建並啟動應用..."
      docker-compose up -d --build
      ;;
    status)
      echo "應用狀態:"
      docker-compose ps
      ;;
    help|*)
      show_help
      ;;
  esac
}

# 執行主函數
main "$@" 