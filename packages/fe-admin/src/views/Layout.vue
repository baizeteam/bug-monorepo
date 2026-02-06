<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { navConfig } from '../router'
import { ArrowDown, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuthStore()

const visibleNavs = computed(() =>
  navConfig.filter((nav) => auth.user && nav.roles.includes(auth.user!.role)),
)

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="layout">
    <el-header class="header">
      <div class="header-left">
        <router-link to="/" class="logo">后台管理</router-link>
        <el-menu
          :default-active="$route.path"
          mode="horizontal"
          :ellipsis="false"
          class="nav-menu"
        >
          <el-menu-item
            v-for="nav in visibleNavs"
            :key="nav.name"
            :index="nav.path"
            @click="router.push(nav.path)"
          >
            {{ nav.label }}
          </el-menu-item>
        </el-menu>
      </div>
      <div class="header-right">
        <el-dropdown trigger="hover" @command="logout">
          <div class="user-trigger">
            <el-avatar :size="32" class="avatar">
              {{ auth.user?.username?.charAt(0)?.toUpperCase() ?? '?' }}
            </el-avatar>
            <span class="username">{{ auth.user?.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>
                <span>{{ auth.user?.username }}</span>
                <el-tag size="small" type="success" style="margin-left: 8px">{{ auth.roleName }}</el-tag>
              </el-dropdown-item>
              <el-dropdown-item divided>
                <div>
                  <span>可执行操作：</span>
                  <div v-for="p in auth.permissions" :key="p" class="perm-item">
                    <div>{{ p }}</div>
                  </div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  flex-direction: column;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.logo {
  font-weight: 700;
  font-size: 1.25rem;
  color: #303133;
  text-decoration: none;
}
.nav-menu {
  border-bottom: none;
}
.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
.user-trigger:hover {
  background: #f5f7fa;
}
.avatar {
  background: #67c23a;
  color: #fff;
}
.username {
  font-size: 0.9rem;
  color: #303133;
}
.perm-item {
  font-size: 0.8rem;
  color: #909399;
  padding: 2px 0;
}
.main {
  flex: 1;
  padding: 1.5rem;
  background: #f5f7fa;
}
</style>
