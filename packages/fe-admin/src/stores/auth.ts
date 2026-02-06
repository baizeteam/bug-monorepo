import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin } from '../api/auth'
import { getProfile } from '../api/user'
import { UserRole, USER_ROLE_LABELS, OPERATION_TYPE_LABELS, OperationType } from '@bug/shared'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<{ id: number; username: string; phone?: string; email?: string; role: number } | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN || user.value?.role === UserRole.SUPER_ADMIN)
  const isSuperAdmin = computed(() => user.value?.role === UserRole.SUPER_ADMIN)

  const roleName = computed(() => {
    const r = user.value?.role
    return r !== undefined ? (USER_ROLE_LABELS[r as UserRole] ?? '未知') : ''
  })

  const permissions = computed(() => {
    const r = user.value?.role
    if (r === UserRole.SUPER_ADMIN) {
      return ['操作订单流转', '分配角色', '用户 CRUD', OPERATION_TYPE_LABELS[OperationType.MANUAL_INTERVENTION], '查看全部']
    }
    if (r === UserRole.ADMIN) {
      return ['查看订单列表', '查看用户列表', '查看时效监控']
    }
    return []
  })

  async function login(account: string, password: string) {
    const res = await apiLogin(account, password)
    token.value = res.token
    user.value = res.user
    localStorage.setItem('token', res.token)
    return res
  }

  async function fetchProfile() {
    if (!token.value) return
    const profile = await getProfile()
    user.value = {
      id: profile.id,
      username: profile.username,
      phone: profile.phone,
      email: profile.email,
      role: profile.role,
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isLoggedIn, isAdmin, isSuperAdmin, roleName, permissions, login, fetchProfile, logout }
})
