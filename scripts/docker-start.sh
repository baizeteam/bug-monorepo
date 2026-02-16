#!/bin/sh
set -e
cd /app/packages/be-main

# 后台运行 NestJS，崩溃时自动重启
run_nest() {
  while true; do
    echo "[$(date)] Starting NestJS..."
    node dist/main.js || true
    echo "[$(date)] NestJS exited (code $?), restarting in 5s..."
    sleep 5
  done
}
run_nest &
NEST_PID=$!

# 等待 NestJS 就绪（最多 60s）
for i in $(seq 1 30); do
  if wget -q -O /dev/null http://127.0.0.1:3000/api-docs 2>/dev/null; then
    echo "[$(date)] NestJS is ready"
    break
  fi
  sleep 2
done

# 前台运行 Nginx（作为主进程）
exec nginx -g "daemon off;"
