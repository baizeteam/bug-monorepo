<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const account = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!account.value || !password.value) {
    error.value = '请输入账号和密码'
    return
  }
  loading.value = true
  try {
    await auth.login(account.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Bug 平台</h1>
      <form @submit.prevent="handleLogin">
        <input v-model="account" type="text" placeholder="手机号或邮箱" />
        <div class="password-wrap">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="密码"
          />
          <span class="eye" @click="showPassword = !showPassword" :title="showPassword ? '隐藏密码' : '显示密码'">
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          </span>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
      </form>
      <p class="register-link">
        <router-link to="/register">没有账号？去注册</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
}
.login-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 320px;
}
.login-card h1 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}
.login-card input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1rem;
}
.password-wrap {
  position: relative;
  margin-bottom: 1rem;
}
.password-wrap input {
  margin-bottom: 0;
  padding-right: 2.5rem;
}
.password-wrap .eye {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  opacity: 0.6;
}
.login-card .error {
  color: #f56c6c;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}
.login-card button {
  width: 100%;
  padding: 0.75rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}
.login-card .register-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
}
</style>
