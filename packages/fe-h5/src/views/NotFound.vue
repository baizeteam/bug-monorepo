<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="card">
      <h1>404</h1>
      <p>页面不存在</p>
      <button class="btn" @click="router.push('/')">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
}

.card {
  text-align: center;
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem;
  color: #333;
}

.card p {
  color: #666;
  margin: 0 0 1.5rem;
}

.btn {
  padding: 0.6rem 1.5rem;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.btn:hover {
  background: #359268;
}
</style>
