<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOperationLogs, getAdminUserList, type OperationLogItem } from '../api/admin'
import { OPERATION_TYPE_LABELS } from '@bug/shared'
import { OperationType } from '@bug/shared'

const list = ref<OperationLogItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(5)
const loading = ref(false)
const bugIdFilter = ref('')
const operatorIdFilter = ref<number | ''>('')
const operationTypeFilter = ref<number | ''>('')
const startTimeFilter = ref('')
const endTimeFilter = ref('')
const userOptions = ref<{ id: number; username: string }[]>([])

async function loadUsers() {
  try {
    const res = await getAdminUserList({ pageSize: 200 })
    userOptions.value = res.list.map((u) => ({ id: u.id, username: u.username }))
  } catch {
    userOptions.value = []
  }
}

async function load() {
  loading.value = true
  try {
    const res = await getOperationLogs({
      bugId: bugIdFilter.value ? parseInt(bugIdFilter.value, 10) : undefined,
      operatorId: operatorIdFilter.value === '' ? undefined : operatorIdFilter.value,
      operationType: operationTypeFilter.value === '' ? undefined : operationTypeFilter.value,
      startTime: startTimeFilter.value || undefined,
      endTime: endTimeFilter.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
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

onMounted(() => {
  loadUsers()
  load()
})
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
          placeholder="订单 ID"
          clearable
          style="width: 100px"
          @keyup.enter="search"
        />
        <el-select
          v-model="operatorIdFilter"
          placeholder="操作人"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="u in userOptions"
            :key="u.id"
            :label="u.username"
            :value="u.id"
          />
        </el-select>
        <el-select
          v-model="operationTypeFilter"
          placeholder="操作类型"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="(label, key) in OPERATION_TYPE_LABELS"
            :key="key"
            :label="label"
            :value="Number(key)"
          />
        </el-select>
        <el-date-picker
          v-model="startTimeFilter"
          type="datetime"
          placeholder="开始时间"
          value-format="YYYY-MM-DDTHH:mm:ss"
          style="width: 180px"
        />
        <el-date-picker
          v-model="endTimeFilter"
          type="datetime"
          placeholder="结束时间"
          value-format="YYYY-MM-DDTHH:mm:ss"
          style="width: 180px"
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
