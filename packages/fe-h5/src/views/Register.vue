<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/auth'

const router = useRouter()
const form = ref({
  username: '',
  phone: '',
  email: '',
  password: '',
  contactInfo: '',
  intro: '',
})
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  if (!form.value.username || !form.value.phone || !form.value.email || !form.value.password) {
    error.value = '请填写必填项'
    return
  }
  loading.value = true
  try {
    await register(form.value)
    router.push('/login')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <h1>注册</h1>
      <form @submit.prevent="handleRegister">
        <input v-model="form.username" placeholder="用户名 *" required />
        <input v-model="form.phone" placeholder="手机号 *" required />
        <input v-model="form.email" type="email" placeholder="邮箱 *" required />
        <div class="password-wrap">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="密码 *"
            required
          />
          <span class="eye" @click="showPassword = !showPassword" :title="showPassword ? '隐藏密码' : '显示密码'">
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          </span>
        </div>
        <input v-model="form.contactInfo" placeholder="微信/QQ（可选）" />
        <input v-model="form.intro" placeholder="个人简介（可选）" />
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">{{ loading ? '注册中...' : '注册' }}</button>
      </form>
      <p class="login-link">
        <router-link to="/login">已有账号？去登录</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
}
.register-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 320px;
}
.register-card h1 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}
.register-card input {
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
.register-card .error {
  color: #f56c6c;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}
.register-card button {
  width: 100%;
  padding: 0.75rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}
.register-card .login-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
}
</style>
