<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOperationLogs, type OperationLogItem } from '../api/admin'
import { OPERATION_TYPE_LABELS } from '@bug/shared'
import { OperationType } from '@bug/shared'

const list = ref<OperationLogItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const bugIdFilter = ref('')

async function load() {
  loading.value = true
  try {
    const res = await getOperationLogs(
      bugIdFilter.value ? parseInt(bugIdFilter.value, 10) : undefined,
      page.value,
      pageSize.value,
    )
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
  <div class="log-list">
    <el-card shadow="never">
      <template #header>
        <span>操作日志</span>
      </template>
      <div class="toolbar">
        <el-input
          v-model="bugIdFilter"
          placeholder="订单 ID 筛选"
          clearable
          style="width: 160px"
          @keyup.enter="search"
        />
        <el-button type="primary" @click="search">搜索</el-button>
      </div>
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="操作人" width="120">
          <template #default="{ row }">
            {{ row.operator?.username ?? row.operatorId }}
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">
              {{ OPERATION_TYPE_LABELS[row.operationType as OperationType] ?? row.operationType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联订单" width="120">
          <template #default="{ row }">
            <template v-if="row.bug">
              <span class="bug-info">#{{ row.bug.id }} {{ row.bug.title }}</span>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="operationContent" label="操作内容" min-width="280" show-overflow-tooltip />
        <el-table-column prop="operationTime" label="操作时间" width="180" />
      </el-table>
      <el-empty v-if="!loading && list.length === 0" description="暂无日志" />
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
  </div>
</template>

<style scoped>
.log-list {
  max-width: 1200px;
  margin: 0 auto;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.bug-info {
  font-size: 0.9rem;
}
</style>
