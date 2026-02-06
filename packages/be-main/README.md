# Bug 平台后端

## 数据库配置

### 方式一：Docker 启动 MySQL（推荐）

在项目根目录执行：

```bash
pnpm db:up
```

然后在 `packages/be-main` 下创建 `.env` 文件：

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root123
DB_DATABASE=bug_platform
```

### 方式二：本地已安装 MySQL

创建数据库后配置 `.env`：

```sql
CREATE DATABASE bug_platform;
```

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=你的密码
DB_DATABASE=bug_platform
```

## 默认管理员

- 账号：`13800000000` 或 `admin@bug.local`
- 密码：`admin123`

首次启动时 Seed 会自动创建。
