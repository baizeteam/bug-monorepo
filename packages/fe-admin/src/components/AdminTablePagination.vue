<script setup lang="ts">
import { ADMIN_TABLE_PAGE_SIZE } from '../composables/useAdminPager'

defineProps<{
  page: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'change'): void
}>()

function onPageChange(p: number) {
  emit('update:page', p)
  emit('change')
}
</script>

<template>
  <el-pagination
    v-if="total > 0"
    :current-page="page"
    :page-size="ADMIN_TABLE_PAGE_SIZE"
    :total="total"
    layout="prev, pager, next"
    class="admin-table-pagination"
    @current-change="onPageChange"
  />
</template>

<style scoped>
.admin-table-pagination {
  margin-top: 1rem;
  justify-content: center;
}
</style>
