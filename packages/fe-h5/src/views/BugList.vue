<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import ListScrollFooter from '../components/ListScrollFooter.vue'
import { getBugList, type BugItem } from '../api/bug'
import { BUG_STATUS_LABELS, TIME_STATUS_LABELS, createPagerState, hasMoreByPayload, patchPagerFromPayload, resetPagerPage, shouldTriggerScrollLoad } from '@bug/shared'

const router = useRouter()
const list = ref<BugItem[]>([])
const pager = reactive(createPagerState(1, 10))
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const keyword = ref('')
const status = ref<number | ''>('')

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
    const res = await getBugList({
      page: pager.page,
      pageSize: pager.pageSize,
      keyword: keyword.value || undefined,
      status: status.value === '' ? undefined : status.value,
    })
    patchPagerFromPayload(pager, res)
    list.value = isFirstPage ? res.list : [...list.value, ...res.list]
    hasMore.value = hasMoreByPayload(res)
    if (hasMore.value) pager.page += 1
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function search() {
  load(true)
}

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
    <div v-else-if="list.length === 0" class="empty">
      <img src="/empty-state.svg" alt="空状态" class="empty-image" />
      <p>Bug 广场暂无数据</p>
      <p class="hint">试试调整筛选条件或稍后再来看看</p>
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
        <p class="desc">{{ item.expectEffect }}</p>
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
.empty {
  text-align: center;
  color: #666;
  padding: 2rem 1rem;
}
.empty-image {
  width: 130px;
  height: auto;
  margin-bottom: 0.6rem;
  opacity: 0.95;
}
.hint {
  margin-top: 0.35rem;
  font-size: 0.82rem;
  color: #9a9a9a;
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
</style>
