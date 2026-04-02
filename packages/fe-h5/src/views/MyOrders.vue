<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ListScrollFooter from '../components/ListScrollFooter.vue'
import { getMyOrders, type MyOrderItem, type MyOrderType } from '../api/order'
import { deleteBug } from '../api/bug'
import { BUG_STATUS_LABELS, TIME_STATUS_LABELS, createPagerState, formatDate, hasMoreByPayload, patchPagerFromPayload, resetPagerPage, shouldTriggerScrollLoad } from '@bug/shared'

const router = useRouter()
const route = useRoute()
const activeTab = ref<MyOrderType>('taken')
const list = ref<MyOrderItem[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const pager = reactive(createPagerState(1, 10))
const pageTitle = computed(() => {
  if (route.name === 'MyNeeds') return '我的需求'
  if (route.name === 'MyPublished') return '我发布的'
  return '我的订单'
})

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
      type: activeTab.value,
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

watch(activeTab, () => {
  load(true)
})

watch(
  () => route.name,
  (name) => {
    if (name === 'MyNeeds') {
      activeTab.value = 'taken'
    } else if (name === 'MyPublished') {
      activeTab.value = 'published'
    }
  },
  { immediate: true },
)

function onScroll() {
  if (!shouldTriggerScrollLoad({
    scrollTop: window.scrollY,
    clientHeight: window.innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
  })) {
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

async function removeBug(item: MyOrderItem) {
  if (item.status !== 0) return
  const ok = window.confirm('确认删除该需求吗？删除后不可恢复。')
  if (!ok) return
  try {
    await deleteBug(item.id)
    await load(true)
  } catch (e) {
    window.alert(e instanceof Error ? e.message : '删除失败')
  }
}
</script>

<template>
  <div class="my-orders">
    <h1>{{ pageTitle }}</h1>
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'taken' }"
        @click="activeTab = 'taken'"
      >
        我的需求
      </button>
      <button
        :class="{ active: activeTab === 'published' }"
        @click="activeTab = 'published'"
      >
        我发布的
      </button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="list.length === 0" class="empty">
      <img src="/empty-state.svg" alt="空状态" class="empty-image" />
      <p>暂无订单</p>
      <p class="hint">
        {{ activeTab === 'taken' ? '承接的 Bug 将显示在这里' : '发布的 Bug 将显示在这里' }}
      </p>
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
          {{ activeTab === 'taken' ? '承接于' : '发布于' }}
          {{ activeTab === 'taken' && item.takeTime ? formatDate(item.takeTime) : item.publishTime ? formatDate(item.publishTime) : '-' }}
        </p>
        <p v-if="activeTab === 'taken' && item.publisher" class="publisher">
          发布人: {{ item.publisher.username }}
        </p>
        <p v-if="activeTab === 'published' && item.taker" class="publisher">
          承接人: {{ item.taker.username }}
        </p>
        <div v-if="activeTab === 'published'" class="actions">
          <button
            v-if="item.status === 0"
            class="danger-btn"
            @click.stop="removeBug(item)"
          >
            删除需求
          </button>
          <span v-else class="disabled-tip">已被承接，不能删除</span>
        </div>
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
.my-orders {
  max-width: 100%;
}
.my-orders h1 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: #1a1a1a;
}
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.tabs button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}
.tabs button.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
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
.actions {
  margin-top: 0.55rem;
}
.danger-btn {
  border: 1px solid #f56c6c;
  background: #fff5f5;
  color: #f56c6c;
  border-radius: 6px;
  padding: 0.25rem 0.55rem;
  font-size: 0.78rem;
}
.disabled-tip {
  color: #999;
  font-size: 0.78rem;
}
</style>
