<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = computed(() => auth.user?.username || '未登录用户')
const avatarText = computed(() => (auth.user?.username?.slice(0, 1) || 'U').toUpperCase())

const menus = [
  { label: '我的需求', to: '/mine/needs' },
  { label: '我发布的', to: '/mine/published' },
  { label: '意见反馈/商务合作', to: '/mine/feedback' },
  { label: '规则说明', to: '/mine/rules' },
]

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="mine-page">
    <section class="profile-card">
      <div class="avatar avatar-placeholder">{{ avatarText }}</div>
      <p class="username">{{ username }}</p>
    </section>

    <section class="menu-card">
      <button v-for="item in menus" :key="item.to" class="menu-item" @click="router.push(item.to)">
        <span>{{ item.label }}</span>
        <span class="arrow">&gt;</span>
      </button>
    </section>

    <button class="logout-btn" @click="logout">退出登录</button>
  </div>
</template>

<style scoped>
.mine-page {
  padding: 0.25rem 0.1rem 1rem;
}
.profile-card,
.menu-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.profile-card {
  padding: 1.25rem 1rem 1rem;
  text-align: center;
  margin-bottom: 0.8rem;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 600;
}
.avatar-placeholder {
  background: #e9f7f0;
  color: #42b883;
}
.username {
  margin: 0.7rem 0 0;
  font-size: 1rem;
  color: #222;
  font-weight: 500;
}
.menu-card {
  overflow: hidden;
}
.menu-item {
  width: 100%;
  border: none;
  border-bottom: 1px solid #f1f1f1;
  background: #fff;
  padding: 0.9rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.96rem;
  color: #333;
}
.menu-item:last-child {
  border-bottom: none;
}
.arrow {
  color: #a8a8a8;
}
.logout-btn {
  margin-top: 1rem;
  width: 100%;
  padding: 0.72rem 0;
  border-radius: 8px;
  border: none;
  background: #42b883;
  color: #fff;
  font-size: 0.95rem;
}
</style>
