<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import ListScrollFooter from '../components/ListScrollFooter.vue'
import { getMyOrders, type MyOrderItem } from '../api/order'
import { BUG_STATUS_LABELS, TIME_STATUS_LABELS, createPagerState, formatDate, hasMoreByPayload, patchPagerFromPayload, resetPagerPage, shouldTriggerScrollLoad } from '@bug/shared'

const router = useRouter()
const list = ref<MyOrderItem[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const pager = reactive(createPagerState(1, 10))

async function load(reset = false) {
  if (loading.value || loadingMore.value || (!reset && !hasMore.value)) return
  if (reset) {
    resetPagerPage(pager)
    hasMore.value = true
  }
  const isFirstPage = pager.page === 1
  if (isFirstPage) loading.value = true
  else loadingMore.value = true
  try {
    const res = await getMyOrders({
      type: 'taken',
      page: pager.page,
      pageSize: pager.pageSize,
    })
    patchPagerFromPayload(pager, res)
    list.value = isFirstPage ? res.list : [...list.value, ...res.list]
    hasMore.value = hasMoreByPayload(res)
    if (hasMore.value) pager.page += 1
  } catch {
    if (isFirstPage) list.value = []
    pager.total = 0
    hasMore.value = false
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function onScroll() {
  if (
    !shouldTriggerScrollLoad({
      scrollTop: window.scrollY,
      clientHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    })
  ) {
    return
  }
  load()
}

onMounted(() => {
  load(true)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="my-orders-page">
    <h1>我的需求</h1>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="list.length === 0" class="empty">
      <img src="/empty-state.svg" alt="空状态" class="empty-image" />
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
          承接于
          {{ item.takeTime ? formatDate(item.takeTime) : '-' }}
        </p>
        <p v-if="item.publisher" class="publisher">发布人: {{ item.publisher.username }}</p>
      </div>
    </div>
    <ListScrollFooter
      :loading="loading"
      :loading-more="loadingMore"
      :has-more="hasMore"
      :list-length="list.length"
      :total="pager.total"
    />
  </div>
</template>

<style scoped>
.my-orders-page {
  max-width: 100%;
}
.my-orders-page h1 {
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
.empty-image {
  width: 130px;
  height: auto;
  margin-bottom: 0.6rem;
  opacity: 0.95;
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
</style>
