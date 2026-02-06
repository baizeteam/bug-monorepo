<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBugDetail, takeBug, updateBugStatus } from '../api/bug'
import { useAuthStore } from '../stores/auth'
import type { BugItem } from '../api/bug'
import { BUG_STATUS_LABELS, formatDate, BugStatus } from '@bug/shared'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const bug = ref<BugItem | null>(null)
const loading = ref(false)
const statusNote = ref('')
const taking = ref(false)

const id = computed(() => parseInt(route.params.id as string, 10))

const canTake = computed(() => bug.value?.status === 0 && auth.isLoggedIn)
const canUpdateStatus = computed(
  () =>
    bug.value &&
    auth.isLoggedIn &&
    (bug.value.status === 1 || bug.value.status === 2) &&
    (auth.user?.id === bug.value.taker?.id || auth.user?.id === bug.value.publisher?.id),
)

const description = computed(() => bug.value?.description ?? '')
const expectEffect = computed(
  () => bug.value?.expectEffect ?? (bug.value as { expect_effect?: string })?.expect_effect ?? '',
)
const publishTimeStr = computed(() =>
  bug.value?.publishTime ? formatDate(bug.value.publishTime) : '',
)

async function load() {
  loading.value = true
  try {
    bug.value = await getBugDetail(id.value)
  } finally {
    loading.value = false
  }
}

async function handleTake() {
  if (!canTake.value) return
  taking.value = true
  try {
    await takeBug(id.value)
    await load()
  } finally {
    taking.value = false
  }
}

async function handleUpdateStatus(newStatus: number) {
  if (!canUpdateStatus.value) return
  try {
    await updateBugStatus(id.value, newStatus, statusNote.value)
    await load()
    statusNote.value = ''
  } catch (e) {
    alert(e instanceof Error ? e.message : '操作失败')
  }
}

onMounted(load)
</script>

<template>
  <div class="bug-detail">
    <button class="back" @click="router.back()">← 返回</button>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="bug" class="content">
      <h1>{{ bug.title }}</h1>
      <p class="meta">
        <span>{{ bug.techStack }}</span>
        <span>{{ BUG_STATUS_LABELS[bug.status as keyof typeof BUG_STATUS_LABELS] ?? bug.status }}</span>
        <span>发布于 {{ publishTimeStr }}</span>
      </p>
      <div class="section">
        <h3>问题描述</h3>
        <div v-html="description" class="desc"></div>
        <p v-if="!description" class="empty">暂无描述</p>
      </div>
      <div class="section">
        <h3>预期效果</h3>
        <p>{{ expectEffect || '暂无' }}</p>
      </div>
      <div v-if="bug.publisher" class="section">
        <h3>发布人</h3>
        <p>{{ bug.publisher.username }}</p>
        <p v-if="bug.publisher.contactInfo">联系方式: {{ bug.publisher.contactInfo }}</p>
      </div>
      <div v-if="canTake" class="actions">
        <button :disabled="taking" @click="handleTake">{{ taking ? '承接中...' : '承接此 Bug' }}</button>
      </div>
      <!-- 沟通中状态仅后台管理员可设置（拉进微信群后由运营改） -->
      <div v-if="canUpdateStatus && bug.status === 2" class="actions">
        <input v-model="statusNote" placeholder="备注（可选）" />
        <button @click="handleUpdateStatus(BugStatus.RESOLVED)">更新为{{ BUG_STATUS_LABELS[BugStatus.RESOLVED] }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bug-detail {
  max-width: 100%;
}
.back {
  margin-bottom: 1rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
}
.loading {
  text-align: center;
  padding: 2rem;
}
.content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.content h1 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}
.content .meta {
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 1rem;
}
.content .meta span {
  margin-right: 0.75rem;
}
.section {
  margin-bottom: 1rem;
}
.section h3 {
  font-size: 0.8rem;
  color: #999;
  margin: 0 0 0.5rem;
}
.section .desc {
  line-height: 1.6;
  font-size: 0.9rem;
}
.section .empty {
  color: #999;
  margin: 0;
}
.actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.actions input {
  flex: 1;
  min-width: 100px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.actions button {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.actions button:disabled {
  opacity: 0.6;
}
</style>
