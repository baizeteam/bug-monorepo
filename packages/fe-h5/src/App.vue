<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(() => {
  if (auth.token && !auth.user) {
    auth.fetchProfile()
  }
})
</script>

<template>
  <router-view />
</template>
