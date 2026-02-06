<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import {
  getAdminUserList,
  createAdminUser,
  updateAdminUser,
  softDeleteAdminUser,
  assignUserRole,
  updateUserStatus,
  type AdminUser,
} from '../api/admin'
import { USER_ROLE_LABELS, USER_STATUS_LABELS } from '@bug/shared'
import { UserRole, UserStatus } from '@bug/shared'
import { ElMessage, ElMessageBox } from 'element-plus'

const auth = useAuthStore()
const list = ref<AdminUser[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const keyword = ref('')
const roleFilter = ref<number | ''>('')
const statusFilter = ref<number | ''>('')

const isSuperAdmin = computed(() => auth.isSuperAdmin)

const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const roleDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const currentUser = ref<AdminUser | null>(null)

const createFormRef = ref()
const editFormRef = ref()

const createForm = ref({
  username: '',
  phone: '',
  email: '',
  password: '',
  contactInfo: '',
  intro: '',
  role: UserRole.USER,
})
const editForm = ref({
  username: '',
  phone: '',
  email: '',
  password: '',
  contactInfo: '',
  intro: '',
})
const assignRoleValue = ref(UserRole.USER)
const assignStatusValue = ref(UserStatus.NORMAL)

const createRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 2, max: 50, message: '长度 2-50', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少6个字符', trigger: 'blur' }],
}
const editRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    const res = await getAdminUserList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      role: roleFilter.value === '' ? undefined : roleFilter.value,
      status: statusFilter.value === '' ? undefined : statusFilter.value,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function openCreate() {
  createForm.value = {
    username: '',
    phone: '',
    email: '',
    password: '',
    contactInfo: '',
    intro: '',
    role: UserRole.USER,
  }
  createDialogVisible.value = true
}

async function handleCreate() {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    try {
      await createAdminUser(createForm.value)
      ElMessage.success('创建成功')
      createDialogVisible.value = false
      load()
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '创建失败')
    }
  })
}

function openEdit(user: AdminUser) {
  currentUser.value = user
  editForm.value = {
    username: user.username,
    phone: user.phone,
    email: user.email,
    password: '',
    contactInfo: user.contactInfo || '',
    intro: '',
  }
  editDialogVisible.value = true
}

async function handleEdit() {
  const user = currentUser.value
  if (!editFormRef.value || !user) return
  await editFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    const data: Record<string, string> = {
      username: editForm.value.username,
      phone: editForm.value.phone,
      email: editForm.value.email,
      contactInfo: editForm.value.contactInfo,
      intro: editForm.value.intro,
    }
    if (editForm.value.password) data.password = editForm.value.password
    try {
      await updateAdminUser(user.id, data)
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      load()
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '更新失败')
    }
  })
}

function openRoleModal(user: AdminUser) {
  currentUser.value = user
  assignRoleValue.value = user.role as UserRole
  roleDialogVisible.value = true
}

async function handleAssignRole() {
  if (!currentUser.value) return
  try {
    await assignUserRole(currentUser.value.id, assignRoleValue.value)
    ElMessage.success('分配成功')
    roleDialogVisible.value = false
    load()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '分配失败')
  }
}

function openStatusModal(user: AdminUser) {
  currentUser.value = user
  assignStatusValue.value = user.status as UserStatus
  statusDialogVisible.value = true
}

async function handleUpdateStatus() {
  if (!currentUser.value) return
  try {
    await updateUserStatus(currentUser.value.id, assignStatusValue.value)
    ElMessage.success('更新成功')
    statusDialogVisible.value = false
    load()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '更新失败')
  }
}

async function handleDelete(user: AdminUser) {
  try {
    await ElMessageBox.confirm(`确定要删除用户「${user.username}」吗？（软删除）`, '确认删除', {
      type: 'warning',
    })
    await softDeleteAdminUser(user.id)
    ElMessage.success('删除成功')
    load()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e instanceof Error ? e.message : '删除失败')
  }
}

const roleOptions = [
  { value: UserRole.USER, label: USER_ROLE_LABELS[UserRole.USER] },
  { value: UserRole.ADMIN, label: USER_ROLE_LABELS[UserRole.ADMIN] },
]
const statusOptions = [
  { value: UserStatus.NORMAL, label: USER_STATUS_LABELS[UserStatus.NORMAL] },
  { value: UserStatus.DISABLED, label: USER_STATUS_LABELS[UserStatus.DISABLED] },
]

onMounted(load)
</script>

<template>
  <div class="user-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button v-if="isSuperAdmin" type="primary" @click="openCreate">新建用户</el-button>
        </div>
      </template>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="用户名/手机/邮箱" clearable style="width: 200px" @keyup.enter="search" />
        <el-select v-model="roleFilter" placeholder="角色" clearable style="width: 120px" @change="search">
          <el-option label="全部角色" value="" />
          <el-option v-for="(label, val) in USER_ROLE_LABELS" :key="val" :label="label" :value="Number(val)" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px" @change="search">
          <el-option label="全部状态" value="" />
          <el-option v-for="(label, val) in USER_STATUS_LABELS" :key="val" :label="label" :value="Number(val)" />
        </el-select>
        <el-button type="primary" @click="search">搜索</el-button>
      </div>
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="phone" label="手机" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ USER_ROLE_LABELS[row.role as UserRole] ?? row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
              {{ USER_STATUS_LABELS[row.status as UserStatus] ?? row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column v-if="isSuperAdmin" label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="openRoleModal(row)">分配角色</el-button>
            <el-button type="primary" link size="small" @click="openStatusModal(row)">状态</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="total > pageSize"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        style="margin-top: 1rem; justify-content: center"
        @current-change="load"
      />
    </el-card>

    <el-dialog v-model="createDialogVisible" title="新建用户" width="400px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="createForm.phone" placeholder="手机号" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" placeholder="邮箱" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createForm.password" type="password" placeholder="密码" show-password clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="createForm.role" style="width: 100%">
            <el-option v-for="opt in roleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="createForm.contactInfo" placeholder="可选" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑用户" width="400px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="手机号" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="邮箱" clearable />
        </el-form-item>
        <el-form-item label="新密码（不填则不修改）">
          <el-input v-model="editForm.password" type="password" placeholder="留空不修改" show-password clearable />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="editForm.contactInfo" placeholder="可选" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="roleDialogVisible" :title="`分配角色 - ${currentUser?.username ?? ''}`" width="400px">
      <el-form label-position="top">
        <el-form-item label="角色">
          <el-select v-model="assignRoleValue" style="width: 100%">
            <el-option v-for="opt in roleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-text type="info" size="small">仅可分配{{ USER_ROLE_LABELS[UserRole.USER] }}或{{ USER_ROLE_LABELS[UserRole.ADMIN] }}</el-text>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignRole">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="statusDialogVisible" :title="`用户状态 - ${currentUser?.username ?? ''}`" width="400px">
      <el-form label-position="top">
        <el-form-item label="状态">
          <el-select v-model="assignStatusValue" style="width: 100%">
            <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateStatus">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-list {
  max-width: 1200px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
</style>
