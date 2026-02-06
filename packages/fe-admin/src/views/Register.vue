<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = ref({
  username: '',
  phone: '',
  email: '',
  password: '',
  contactInfo: '',
  intro: '',
})

const rules = {
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

async function handleRegister() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    loading.value = true
    try {
      await register(form.value)
      ElMessage.success('注册成功')
      router.push('/login')
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '注册失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="register-page">
    <el-card class="register-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>注册</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名 *" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="手机号 *" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" placeholder="邮箱 *" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码 *" show-password clearable />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="form.contactInfo" placeholder="微信/QQ（可选）" clearable />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="form.intro" type="textarea" placeholder="可选" :rows="2" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleRegister">
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-link">
        <el-link type="primary" :underline="false" @click="router.push('/login')">
          已有账号？去登录
        </el-link>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.register-card {
  width: 400px;
}
.card-header {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}
.login-link {
  text-align: center;
  margin-top: 0.5rem;
}
</style>
