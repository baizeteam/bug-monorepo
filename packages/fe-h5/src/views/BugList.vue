<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBugList, type BugItem } from '../api/bug'
import { BUG_STATUS_LABELS, TIME_STATUS_LABELS } from '@bug/shared'

const router = useRouter()
const list = ref<BugItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const keyword = ref('')
const status = ref<number | ''>('')

async function load() {
  loading.value = true
  try {
    const res = await getBugList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      status: status.value === '' ? undefined : status.value,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

onMounted(load)
</script>

<template>
  <div class="bug-list">
    <div class="toolbar">
      <input v-model="keyword" placeholder="关键词搜索" @keyup.enter="search" />
      <select v-model="status" @change="search">
        <option value="">全部状态</option>
        <option v-for="(label, val) in BUG_STATUS_LABELS" :key="val" :value="Number(val)">{{ label }}</option>
      </select>
      <button @click="search">搜索</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="list">
      <div
        v-for="item in list"
        :key="item.id"
        class="card"
        @click="router.push(`/bug/${item.id}`)"
      >
        <h3>{{ item.title }}</h3>
        <p class="meta">
          <span>{{ item.techStack }}</span>
          <span>{{ BUG_STATUS_LABELS[item.status as keyof typeof BUG_STATUS_LABELS] ?? item.status }}</span>
          <span v-if="item.timeStatus" :class="item.timeStatus === 2 ? 'expired' : ''">
            {{ TIME_STATUS_LABELS[item.timeStatus as keyof typeof TIME_STATUS_LABELS] ?? item.timeStatus }}
          </span>
        </p>
        <p class="desc">{{ item.expectEffect }}</p>
      </div>
    </div>
    <div v-if="total > pageSize" class="pagination">
      <button :disabled="page <= 1" @click="page--; load()">上一页</button>
      <span>{{ page }} / {{ Math.ceil(total / pageSize) }}</span>
      <button :disabled="page * pageSize >= total" @click="page++; load()">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.bug-list {
  max-width: 100%;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.toolbar input,
.toolbar select {
  flex: 1;
  min-width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.875rem;
}
.toolbar button {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.card h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}
.card .meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}
.card .meta .expired {
  color: #f56c6c;
}
.card .desc {
  font-size: 0.8rem;
  color: #999;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
