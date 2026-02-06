<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <main class="main">
      <router-view />
    </main>
    <nav class="tabbar">
      <router-link to="/" class="tab" active-class="active">
        <span class="icon">📋</span>
        <span>Bug 列表</span>
      </router-link>
      <router-link v-if="auth.isLoggedIn" to="/create" class="tab" active-class="active">
        <span class="icon">➕</span>
        <span>发布</span>
      </router-link>
      <router-link to="/orders" class="tab" active-class="active">
        <span class="icon">📦</span>
        <span>我的订单</span>
      </router-link>
      <div v-if="auth.isLoggedIn" class="tab user-tab">
        <span class="icon">👤</span>
        <span>{{ auth.user?.username }}</span>
        <button class="logout-btn" @click="logout">退出</button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.main {
  flex: 1;
  padding: 0.75rem;
  padding-bottom: 4rem;
}
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #fff;
  border-top: 1px solid #eee;
  z-index: 100;
}
.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  color: #666;
  text-decoration: none;
  font-size: 0.75rem;
}
.tab .icon {
  font-size: 1.25rem;
}
.tab.active {
  color: #42b883;
}
.user-tab {
  position: relative;
}
.logout-btn {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  padding: 0.15rem 0.4rem;
  font-size: 0.6rem;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  color: #666;
}
</style>
