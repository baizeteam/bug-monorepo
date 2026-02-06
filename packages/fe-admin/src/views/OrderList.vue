<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminOrders, getAdminOrderById, getAdminOrderStats, type AdminOrderItem, type AdminOrderDetail } from '../api/admin'
import { BUG_STATUS_LABELS, TIME_STATUS_LABELS } from '@bug/shared'
import { BugStatus, TimeStatus } from '@bug/shared'

const list = ref<AdminOrderItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const keyword = ref('')
const statusFilter = ref<number | ''>('')
const timeStatusFilter = ref<number | ''>('')

const stats = ref<{ total: number; byStatus: Record<number, number> } | null>(null)
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<AdminOrderDetail | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await getAdminOrders({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      status: statusFilter.value === '' ? undefined : (statusFilter.value as BugStatus),
      timeStatus: timeStatusFilter.value === '' ? undefined : (timeStatusFilter.value as TimeStatus),
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await getAdminOrderStats()
  } catch {
    stats.value = null
  }
}

function search() {
  page.value = 1
  load()
}

async function openDetail(id: number) {
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  try {
    detailData.value = await getAdminOrderById(id)
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  load()
  loadStats()
})
</script>

<template>
  <div class="order-list">
    <div v-if="stats" class="stats-row">
      <el-card shadow="never" class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">全部订单</div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-value">{{ stats.byStatus[BugStatus.PENDING] ?? 0 }}</div>
        <div class="stat-label">{{ BUG_STATUS_LABELS[BugStatus.PENDING] }}</div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-value">{{ stats.byStatus[BugStatus.TAKEN] ?? 0 }}</div>
        <div class="stat-label">{{ BUG_STATUS_LABELS[BugStatus.TAKEN] }}</div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-value">{{ stats.byStatus[BugStatus.COMMUNICATING] ?? 0 }}</div>
        <div class="stat-label">{{ BUG_STATUS_LABELS[BugStatus.COMMUNICATING] }}</div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-value">{{ stats.byStatus[BugStatus.RESOLVED] ?? 0 }}</div>
        <div class="stat-label">{{ BUG_STATUS_LABELS[BugStatus.RESOLVED] }}</div>
      </el-card>
    </div>
    <el-card shadow="never">
      <template #header>
        <span>订单列表</span>
      </template>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="标题搜索" clearable style="width: 200px" @keyup.enter="search" />
        <el-select v-model="statusFilter" placeholder="订单状态" clearable style="width: 120px" @change="search">
          <el-option label="全部状态" value="" />
          <el-option v-for="(label, val) in BUG_STATUS_LABELS" :key="val" :label="label" :value="Number(val)" />
        </el-select>
        <el-select v-model="timeStatusFilter" placeholder="时效状态" clearable style="width: 120px" @change="search">
          <el-option label="全部时效" value="" />
          <el-option v-for="(label, val) in TIME_STATUS_LABELS" :key="val" :label="label" :value="Number(val)" />
        </el-select>
        <el-button type="primary" @click="search">搜索</el-button>
      </div>
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row.id)">{{ row.title }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="techStack" label="技术栈" width="120" show-overflow-tooltip />
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ BUG_STATUS_LABELS[row.status as BugStatus] ?? row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时效状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.timeStatus === TimeStatus.NORMAL ? 'success' : row.timeStatus === TimeStatus.WARNING ? 'warning' : 'danger'"
              size="small"
            >
              {{ TIME_STATUS_LABELS[row.timeStatus as TimeStatus] ?? row.timeStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布人" width="100">
          <template #default="{ row }">
            {{ row.publisher?.username ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="承接人" width="100">
          <template #default="{ row }">
            {{ row.taker?.username ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="170" />
        <el-table-column prop="takeTime" label="承接时间" width="170">
          <template #default="{ row }">
            {{ row.takeTime ?? '-' }}
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && list.length === 0" description="暂无订单数据" />
      <el-pagination
        v-if="total > pageSize"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        style="margin-top: 1rem; justify-content: center"
        @current-change="load"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="订单详情" width="600px" destroy-on-close>
      <el-skeleton v-if="detailLoading" :rows="6" animated />
      <div v-else-if="detailData" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
          <el-descriptions-item label="技术栈">{{ detailData.techStack }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag size="small">{{ BUG_STATUS_LABELS[detailData.status as BugStatus] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="时效状态">
            <el-tag
              :type="detailData.timeStatus === TimeStatus.NORMAL ? 'success' : detailData.timeStatus === TimeStatus.WARNING ? 'warning' : 'danger'"
              size="small"
            >
              {{ TIME_STATUS_LABELS[detailData.timeStatus as TimeStatus] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布人">{{ detailData.publisher?.username ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="承接人">{{ detailData.taker?.username ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ detailData.publishTime }}</el-descriptions-item>
          <el-descriptions-item label="承接时间">{{ detailData.takeTime ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="问题描述">
            <div class="desc-text" v-html="detailData.description"></div>
          </el-descriptions-item>
          <el-descriptions-item label="预期效果">{{ detailData.expectEffect }}</el-descriptions-item>
          <el-descriptions-item v-if="detailData.operationNote" label="运营备注">{{ detailData.operationNote }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.order-list {
  max-width: 1200px;
  margin: 0 auto;
}
.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.stat-card {
  flex: 1;
  min-width: 100px;
  text-align: center;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #303133;
}
.stat-label {
  font-size: 0.8rem;
  color: #909399;
  margin-top: 0.25rem;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.detail-content .desc-text {
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.6;
}
</style>
