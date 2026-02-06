# Bug 平台 - 打包部署文档

## 一、环境要求

- **Node.js** >= 18
- **pnpm** >= 8
- **MySQL** >= 5.7 或 8.0
- （可选）Docker / Docker Compose

## 二、项目结构

```
nest-vue3-monorepo/
├── packages/
│   ├── be-main/      # NestJS 后端
│   ├── fe-admin/     # Vue3 管理后台（PC 端）
│   ├── fe-h5/        # Vue3 用户端（H5）
│   └── shared/       # 共享类型与工具
├── docker-compose.yml
└── package.json
```

## 三、数据库准备

### 方式一：Docker 启动 MySQL（推荐）

```bash
# 在项目根目录
pnpm db:up
```

### 方式二：本地 MySQL

创建数据库：

```sql
CREATE DATABASE bug_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 后端环境变量

在 `packages/be-main` 下创建 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root123
DB_DATABASE=bug_platform
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
```

> 生产环境务必修改 `JWT_SECRET` 为强随机字符串。

## 四、打包构建

### 4.1 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 4.2 构建顺序

需按依赖顺序构建：先 `shared`，再后端和前端。

```bash
# 1. 构建共享包
pnpm --filter @bug/shared build

# 2. 构建后端
pnpm --filter @bug/be-main build

# 3. 构建前端（可并行）
pnpm --filter @bug/fe-admin build
pnpm --filter @bug/fe-h5 build
```

或使用一条命令：

```bash
pnpm --filter @bug/shared build && \
pnpm --filter @bug/be-main build && \
pnpm --filter @bug/fe-admin build && \
pnpm --filter @bug/fe-h5 build
```

### 4.3 构建产物

| 包 | 产物目录 | 说明 |
|----|----------|------|
| be-main | `packages/be-main/dist/` | 编译后的 Node.js 应用 |
| fe-admin | `packages/fe-admin/dist/` | 静态资源（HTML/JS/CSS） |
| fe-h5 | `packages/fe-h5/dist/` | 静态资源（HTML/JS/CSS） |

## 五、部署方式

### 5.1 后端部署（NestJS）

**使用 Node 直接运行：**

```bash
cd packages/be-main
node dist/main.js
```

**使用 PM2（推荐生产环境）：**

```bash
cd packages/be-main
pm2 start dist/main.js --name bug-api
pm2 save
pm2 startup
```

**环境变量：** 确保运行目录或系统中有 `.env`，或通过 `PM2_ENV` 等方式注入。

### 5.2 前端部署（静态资源）

将 `fe-admin/dist` 和 `fe-h5/dist` 部署到 Web 服务器（Nginx、Apache、CDN 等）。

**生产环境环境变量：** 构建前设置 `VITE_API_BASE_URL` 为实际 API 地址，例如：

```bash
# Windows PowerShell
$env:VITE_API_BASE_URL="https://api.yourdomain.com"; pnpm --filter @bug/fe-admin build

# Linux / macOS
VITE_API_BASE_URL=https://api.yourdomain.com pnpm --filter @bug/fe-admin build
```

fe-h5 同理。

### 5.3 Nginx 配置示例

```nginx
# 后端 API
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 管理后台 fe-admin
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /var/www/bug-platform/admin;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 用户端 fe-h5
server {
    listen 80;
    server_name h5.yourdomain.com;
    root /var/www/bug-platform/h5;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> `try_files ... /index.html` 用于支持 Vue Router 的 history 模式，404 路由会由前端处理。

## 六、清空数据库

超级管理员可通过 API 清空所有数据并重新初始化种子数据：

```bash
# 需要先登录获取 token，再调用
curl -X POST https://api.yourdomain.com/api/admin/db/reset \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

或在 Swagger UI（`/api-docs`）中调用 `POST /api/admin/db/reset`。

**说明：** 仅 `SUPER_ADMIN` 角色可调用。执行后会清空 `user`、`bug`、`operation_log`、`time_rule` 表，并重新创建默认管理员（super_admin/admin，密码 admin123）和时效规则。

## 七、开发环境快速启动

```bash
# 启动 MySQL（若使用 Docker）
pnpm db:up

# 启动全部服务（后端 + 两个前端）
pnpm dev
```

- 后端：http://localhost:3000
- 管理后台：http://localhost:4000
- 用户端 H5：http://localhost:5000
- API 文档：http://localhost:3000/api-docs

## 九、服务器部署（175.178.132.217 示例）

### 9.1 首次部署流程

**步骤 1：SSH 登录服务器**

```powershell
ssh root@175.178.132.217
# 输入密码
```

**步骤 2：执行服务器初始化**

先运行一次 `.\scripts\deploy.ps1` 上传文件，然后 SSH 登录执行：

```bash
cd /var/www/bug-platform && bash server-setup.sh
```

该脚本会：查找 Nginx 配置、安装 Docker、启动 MySQL、创建目录。

**步骤 3：在本地执行部署脚本**

```powershell
cd D:\Desktop\essay\nest-vue3-monorepo
.\scripts\deploy.ps1 -ServerIp "175.178.132.217"
# 按提示输入 SSH 密码（约 4 次）
```

**步骤 4：SSH 登录后启动后端并配置 Nginx**

```bash
# 安装 PM2（若未安装）
npm install -g pm2

# 启动后端
cd /var/www/bug-platform/api
pm2 start dist/main.js --name bug-api
pm2 save

# 配置 Nginx
cp /var/www/bug-platform/nginx-bug-platform.conf /etc/nginx/sites-available/bug-platform.conf
ln -sf /etc/nginx/sites-available/bug-platform.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 9.2 访问地址

- H5 用户端：http://175.178.132.217/
- 管理后台：http://175.178.132.217/admin/
- API 文档：http://175.178.132.217/api-docs

### 9.3 数据库说明

MySQL 通过 Docker 运行，默认配置：

- 端口：3306
- 数据库：bug_platform
- root 密码：root123
- 应用用户：bug / bug123

后端 `.env` 已由部署脚本生成，使用 `root/root123` 连接。

## 十、常见问题

### 1. 前端请求 404 或跨域

- 确认 `VITE_API_BASE_URL` 与后端实际地址一致
- 后端已配置 CORS，允许 `http://localhost` 任意端口

### 2. 数据库连接失败

- 检查 MySQL 是否启动
- 核对 `.env` 中 `DB_HOST`、`DB_PORT`、`DB_USERNAME`、`DB_PASSWORD`、`DB_DATABASE`

### 3. 前端路由 404

- 确保 Nginx 使用 `try_files $uri $uri/ /index.html`
- 前端已配置 404 兜底路由，访问不存在的路径会显示「页面不存在」
