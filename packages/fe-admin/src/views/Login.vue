<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ account: 'super_admin', password: 'admin123' })
const loading = ref(false)
const formRef = ref()

const rules = {
  account: [{ required: true, message: '请输入用户名/手机号/邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    loading.value = true
    try {
      await auth.login(form.account, form.password)
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '登录失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>后台管理</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" placeholder="用户名/手机号/邮箱" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" show-password clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.login-card {
  width: 380px;
}
.card-header {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}
</style>
