import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin } from '../api/auth'
import { getProfile } from '../api/user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<{ id: number; username: string; phone?: string; email?: string; role: number } | null>(null)

  const isLoggedIn = computed(() => !!token.value)

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

  return { token, user, isLoggedIn, login, fetchProfile, logout }
})
