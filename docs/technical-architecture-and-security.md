# 技术文档：架构、工程化与安全治理

## 1. Monorepo 工程结构

仓库采用 `pnpm + Turbo` 的 monorepo 模式，核心包如下：

- `packages/be-main`：NestJS 后端服务
- `packages/fe-h5`：用户端前端（移动优先）
- `packages/fe-admin`：管理端前端（运营后台）
- `packages/shared`：共享类型、常量、工具函数（前后端复用）

优势：

- 类型与常量统一，降低联调偏差
- 多端共享能力沉淀在 `@bug/shared`
- Turbo 支持任务编排，便于统一开发与构建

## 2. 鉴权与会话策略

- 登录后使用 JWT，无状态鉴权
- 前端统一在请求拦截器携带 token
- 两端统一 401 处理策略：
  - 自动清 token
  - 跳转登录
  - 保留 redirect 回跳路径

## 3. 权限模型

角色定义：

- `USER`：H5 普通业务用户
- `ADMIN`：后台运营管理员
- `SUPER_ADMIN`：后台超级管理员（最高治理权限）

关键策略：

- H5 写接口仅 `USER` 可调用
- `SUPER_ADMIN` 可执行治理操作（如删除任意订单）

## 4. 订单核心业务规则

- 禁止发布人承接自己发布的订单
- Bug 广场默认仅展示待承接订单（`PENDING`）
- 发布人仅可删除未承接订单
- 超管可在后台删除任意订单（软删除）

## 5. 应用层限流（已落地）

已实现多维限流能力（后端）：

- 登录接口：`IP + 设备 + 账号 + 接口全局`
- 业务写接口：`userId + 设备 + 接口全局`

说明：

- 前端自动注入 `x-device-id`
- 限流超限返回 429，提示重试等待时间

## 6. 网关层限流（模板化）

已提供 Nginx 示例配置文件：

- `docs/nginx-rate-limit.example.conf`
- `docs/nginx-rate-limit.http.inc.conf`
- `docs/nginx-rate-limit.server.example.conf`

建议线上采用“网关层 + 应用层”双层防护。

## 7. 开发与启动脚本

- `scripts/dev-all.ps1`：一键启动数据库 + shared + 多端服务
- `scripts/dev-all.bat`：Windows 双击版一键启动（含 Docker 就绪检查）
- 根脚本：
  - `pnpm dev:backend`
  - `pnpm dev:all`

## 8. 运维建议

- 生产环境强制 HTTPS
- 网关限流阈值按流量动态调优
- 关键接口监控 429 比例和失败率
- 定期审计操作日志与高风险行为
