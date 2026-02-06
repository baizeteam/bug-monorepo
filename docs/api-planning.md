# 后端接口规划

## 一、RBAC 权限控制

### 1.1 角色定义

| 角色 | 枚举值 | 说明 |
|------|--------|------|
| USER | 0 | 普通用户（fe-h5 端） |
| ADMIN | 1 | 普通管理员 |
| SUPER_ADMIN | 2 | 超级管理员 |

### 1.2 权限划分

| 功能 | 普通管理员 | 超级管理员 |
|------|-----------|-----------|
| 查看用户列表 | ✅ | ✅ |
| 查看用户详情 | ✅ | ✅ |
| 查看订单/时效监控 | ✅ | ✅ |
| 新建用户 | ❌ | ✅ |
| 编辑用户 | ❌ | ✅ |
| 软删除用户 | ❌ | ✅ |
| 分配角色 | ❌ | ✅ |
| 启用/禁用用户 | ❌ | ✅ |
| 人工介入（订单流转） | ❌ | ✅ |

**订单流转**：发布 → 有人接单 → 后台运营拉进微信群（改为沟通中）→ 已解决

**订单状态更新**（`POST /api/bug/:id/status`）：
- 超级管理员：可修改任意订单状态
- 普通管理员：可将**任意**订单改为「沟通中」（运营拉群后改状态）
- 承接人/发布人：可修改自己相关订单状态，**但不可改为「沟通中」**（仅管理员可操作）

**软删除**：所有删除操作均为软删除（`isDelete = 1`），“删除”用户不会物理删除数据。

### 1.3 数据模型

```
User (用户)
- role: number (0=USER, 1=ADMIN, 2=SUPER_ADMIN)
- isDelete: number (0=正常, 1=已软删除)
```

### 1.4 权限守卫

- 路由级：`@UseGuards(JwtAuthGuard, RolesGuard)`
- 装饰器：`@Roles(UserRole.SUPER_ADMIN)` 等

---

## 二、订单管理

### 2.1 数据模型（Bug 即订单）

当前 Bug 实体已具备订单属性：
- 发布人、承接人
- 状态流转
- 操作日志

可考虑：
- 保持 Bug 实体，增加 `Order` 视图/聚合
- 或新建 Order 表关联 Bug（一对一等）

### 2.2 接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/order/my | 当前用户承接的订单（我的订单） | 登录 |
| GET | /api/admin/overdue-bugs | 时效监控（即将/已超期 Bug） | admin+ |
| POST | /api/admin/manual-intervention | 人工介入（订单流转） | 仅超管 |
| GET | /api/admin/orders | 订单列表（分页、筛选） | admin+ |
| GET | /api/admin/orders/:id | 订单详情 | admin+ |
| GET | /api/admin/orders/stats | 订单统计 | admin+ |

### 2.3 我的订单响应示例

```json
{
  "list": [
    {
      "id": 1,
      "bugId": 1,
      "title": "xxx",
      "status": 1,
      "timeStatus": 0,
      "publishTime": "2025-02-06T...",
      "takeTime": "2025-02-06T...",
      "publisher": { "id": 1, "username": "a" }
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 20
}
```

---

## 三、用户管理

### 3.1 接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/admin/users | 用户列表（分页、搜索） | admin+ |
| GET | /api/admin/users/:id | 用户详情 | admin+ |
| POST | /api/admin/users | 创建用户 | 仅超管 |
| PUT | /api/admin/users/:id | 更新用户 | 仅超管 |
| DELETE | /api/admin/users/:id | 软删除用户 | 仅超管 |
| PUT | /api/admin/users/:id/role | 分配角色 | 仅超管 |
| PUT | /api/admin/users/:id/status | 启用/禁用用户 | 仅超管 |

### 3.2 用户列表请求参数

```
page, pageSize, keyword?, role?, status?
```

### 3.3 用户列表响应

```json
{
  "list": [
    {
      "id": 1,
      "username": "xxx",
      "phone": "xxx",
      "email": "xxx",
      "role": 0,
      "status": 0,
      "createdAt": "2025-02-06T..."
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

---

## 四、实现状态

- [x] 用户管理 CRUD（含 RBAC 权限划分）
- [x] 软删除
- [x] 我的订单：`GET /api/order/my`（fe-h5 已对接）
- [x] 订单列表（admin）展示：`GET /api/admin/orders`（fe-admin 已对接）
- [x] 订单详情：`GET /api/admin/orders/:id`
- [x] 订单统计：`GET /api/admin/orders/stats`（fe-admin 订单列表页展示统计卡片与详情弹窗）
