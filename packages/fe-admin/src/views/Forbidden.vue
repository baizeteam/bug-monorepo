<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="forbidden">
    <el-result icon="warning" title="无权限" sub-title="您没有后台管理权限">
      <template #extra>
        <el-button type="primary" @click="router.push('/login')">返回登录</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.forbidden {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
</style>
