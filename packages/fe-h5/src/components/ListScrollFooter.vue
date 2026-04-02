<script setup lang="ts">
defineProps<{
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  listLength: number
  total: number
}>()
</script>

<template>
  <div v-if="loadingMore" class="loading-more">加载更多中...</div>
  <div v-else-if="listLength > 0 && !hasMore" class="loading-more">已经到底啦</div>
  <div v-if="!loading && listLength > 0" class="pagination">
    <span>共 {{ total }} 条</span>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1.5rem;
  color: #999;
  font-size: 0.82rem;
}
.loading-more {
  text-align: center;
  color: #999;
  padding: 1rem 0;
  font-size: 0.82rem;
}
</style>
