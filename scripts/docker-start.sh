#!/bin/sh
set -e
# 后台启动 NestJS
cd /app/packages/be-main
node dist/main.js &
# 等待 NestJS 就绪
sleep 3
# 前台运行 Nginx（作为主进程）
exec nginx -g "daemon off;"
