#!/bin/bash
# Bug 平台 - 服务器端部署脚本
# 用法：在服务器上执行 bash server-setup.sh

set -e

echo "========== 1. 查找 Nginx 配置与静态资源目录 =========="
if command -v nginx &>/dev/null; then
  echo "Nginx 已安装"
  nginx -v 2>&1
  echo ""
  echo "主配置:"
  nginx -t 2>&1 | head -5
  echo ""
  echo "配置文件位置:"
  ls -la /etc/nginx/ 2>/dev/null || ls -la /usr/local/nginx/conf/ 2>/dev/null || echo "未找到常见路径"
  echo ""
  echo "sites-enabled 中的 root 目录:"
  grep -r "root " /etc/nginx/ 2>/dev/null | grep -v "#" | head -20 || true
  echo ""
  echo "当前 Nginx 代理的站点:"
  grep -r "server_name\|root " /etc/nginx/sites-enabled/ 2>/dev/null || grep -r "server_name\|root " /etc/nginx/conf.d/ 2>/dev/null || echo "请手动查看 /etc/nginx/"
else
  echo "Nginx 未安装，将使用默认目录 /var/www/bug-platform"
fi

echo ""
echo "========== 2. 检查 Docker =========="
if command -v docker &>/dev/null; then
  echo "Docker 已安装"
  docker --version
else
  echo "Docker 未安装，正在安装..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

echo ""
echo "========== 3. 创建项目目录 =========="
DEPLOY_ROOT="/var/www/bug-platform"
mkdir -p "$DEPLOY_ROOT"/{admin,h5,api}
echo "目录已创建: $DEPLOY_ROOT"
ls -la "$DEPLOY_ROOT"

echo ""
echo "========== 4. 启动 MySQL (Docker) =========="
cd /tmp
cat > docker-compose-mysql.yml << 'MYSQLEOF'
services:
  mysql:
    image: mysql:8.0
    container_name: bug-platform-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: bug_platform
      MYSQL_USER: bug
      MYSQL_PASSWORD: bug123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

volumes:
  mysql_data:
MYSQLEOF

if docker ps -a --format '{{.Names}}' | grep -q bug-platform-mysql; then
  echo "MySQL 容器已存在，启动中..."
  docker start bug-platform-mysql
else
  echo "首次创建 MySQL 容器..."
  (docker compose -f docker-compose-mysql.yml up -d 2>/dev/null) || docker-compose -f docker-compose-mysql.yml up -d
fi
echo "等待 MySQL 就绪..."
sleep 5
docker ps | grep mysql || true

echo ""
echo "========== 5. 检查 Node.js / PM2 =========="
if command -v node &>/dev/null; then
  echo "Node.js: $(node -v)"
else
  echo "Node.js 未安装，请安装 Node 18+: curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs"
fi
if command -v pm2 &>/dev/null; then
  echo "PM2 已安装"
else
  echo "PM2 未安装，安装: npm install -g pm2"
fi

echo ""
echo "========== 完成 =========="
echo "静态资源目录: $DEPLOY_ROOT/admin (fe-admin), $DEPLOY_ROOT/h5 (fe-h5)"
echo "后端目录: $DEPLOY_ROOT/api (be-main dist + .env)"
echo "MySQL: localhost:3306, 数据库 bug_platform, root/root123 或 bug/bug123"
echo ""
echo "下一步: 在本地构建后，用 scp 上传到上述目录，然后配置 Nginx"
