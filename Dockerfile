# ============================================
# 多阶段构建：NestJS 后端 + Vite 前端 一体化镜像
# ============================================

# ---------- Stage 1: 构建3----------
FROM node:20-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# 复制依赖声明与源码（先复制源码，再 install，避免覆盖 pnpm 创建的 node_modules 符号链接）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/shared ./packages/shared
COPY packages/be-main ./packages/be-main
COPY packages/fe-admin ./packages/fe-admin
COPY packages/fe-h5 ./packages/fe-h5

# 安装依赖（含 devDependencies，用于构建）
RUN pnpm install --frozen-lockfile

# 构建：shared -> be-main, fe-admin, fe-h5
# VITE_API_BASE_URL 留空则使用相对路径 /api，同源由 Nginx 代理
RUN pnpm run build

# fe-admin 需 base=/admin/，单独重新构建（覆盖默认产物）
ENV VITE_BASE=/admin/
RUN pnpm --filter @bug/fe-admin build

# ---------- Stage 2: 生产镜像 ----------
FROM node:20-alpine

# 安装 nginx
RUN apk add --no-cache nginx

WORKDIR /app

# 从构建阶段复制产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/be-main ./packages/be-main
COPY --from=builder /app/packages/fe-admin/dist ./packages/fe-admin/dist
COPY --from=builder /app/packages/fe-h5/dist ./packages/fe-h5/dist

# 复制 Nginx 配置（Alpine 使用 conf.d）
COPY scripts/docker-nginx.conf /etc/nginx/conf.d/default.conf

# 复制静态文件到 Nginx 根目录
RUN mkdir -p /app/static/admin /app/static/h5 && \
    cp -r packages/fe-admin/dist/* /app/static/admin/ && \
    cp -r packages/fe-h5/dist/* /app/static/h5/

# 启动脚本：先启动 NestJS，再前台运行 Nginx
COPY scripts/docker-start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 环境变量（可通过 docker run -e 覆盖）
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 80

CMD ["/app/start.sh"]
