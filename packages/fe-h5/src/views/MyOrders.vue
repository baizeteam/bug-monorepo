<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyOrders, type MyOrderItem } from '../api/order'
import { BUG_STATUS_LABELS, TIME_STATUS_LABELS, formatDate } from '@bug/shared'

const router = useRouter()
const list = ref<MyOrderItem[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

async function load() {
  loading.value = true
  try {
    const res = await getMyOrders({ page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
  } catch {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="my-orders">
    <h1>我的订单</h1>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="list.length === 0" class="empty">
      <p>暂无订单</p>
      <p class="hint">承接的 Bug 将显示在这里</p>
    </div>
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
        <p class="time">
          承接于 {{ item.takeTime ? formatDate(item.takeTime) : '-' }}
        </p>
        <p v-if="item.publisher" class="publisher">
          发布人: {{ item.publisher.username }}
        </p>
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
.my-orders {
  max-width: 100%;
}
.my-orders h1 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: #1a1a1a;
}
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
.empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}
.empty .hint {
  font-size: 0.8rem;
  margin-top: 0.5rem;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}
.card h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #1a1a1a;
}
.card .meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}
.card .meta .expired {
  color: #f56c6c;
}
.card .time,
.card .publisher {
  font-size: 0.8rem;
  color: #999;
  margin: 0;
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
