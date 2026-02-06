<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { BUG_STATUS_LABELS, TIME_STATUS_LABELS, OPERATION_TYPE_LABELS, OperationType, BugStatus, TimeStatus } from '@bug/shared'
import { getOverdueBugs, manualIntervention } from '../api/admin'
import { ElMessage } from 'element-plus'

const auth = useAuthStore()
const isSuperAdmin = computed(() => auth.isSuperAdmin)
const list = ref<any[]>([])
const loading = ref(false)
const timeStatus = ref<number | ''>('')
const interveneNote = ref('')
const interveneBugId = ref<number | null>(null)
const interveneStatus = ref(BugStatus.COMMUNICATING)
const interveneLoading = ref(false)
const dialogVisible = ref(false)

async function load() {
  loading.value = true
  try {
    list.value = await getOverdueBugs(
      timeStatus.value === '' ? undefined : timeStatus.value,
    )
  } finally {
    loading.value = false
  }
}

async function handleIntervene() {
  if (!interveneBugId.value) return
  interveneLoading.value = true
  try {
    await manualIntervention(interveneBugId.value, interveneStatus.value, interveneNote.value)
    ElMessage.success('操作成功')
    interveneBugId.value = null
    interveneNote.value = ''
    dialogVisible.value = false
    load()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '操作失败')
  } finally {
    interveneLoading.value = false
  }
}

function openIntervene(bug: any) {
  interveneBugId.value = bug.id
  interveneNote.value = ''
  interveneStatus.value = BugStatus.COMMUNICATING
  dialogVisible.value = true
}

onMounted(load)
</script>

<template>
  <div class="admin">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>时效监控</span>
          <el-select v-model="timeStatus" placeholder="筛选状态" style="width: 120px" @change="load">
            <el-option label="全部" value="" />
            <el-option :label="TIME_STATUS_LABELS[TimeStatus.WARNING]" :value="TimeStatus.WARNING" />
            <el-option :label="TIME_STATUS_LABELS[TimeStatus.EXPIRED]" :value="TimeStatus.EXPIRED" />
          </el-select>
          <el-button type="primary" :loading="loading" @click="load">刷新</el-button>
        </div>
      </template>
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="techStack" label="技术栈" width="120" />
        <el-table-column label="Bug 状态" width="100">
          <template #default="{ row }">
            {{ BUG_STATUS_LABELS[row.status as keyof typeof BUG_STATUS_LABELS] ?? row.status }}
          </template>
        </el-table-column>
        <el-table-column label="时效状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.timeStatus === 2 ? 'danger' : row.timeStatus === 1 ? 'warning' : 'success'" size="small">
              {{ TIME_STATUS_LABELS[row.timeStatus as keyof typeof TIME_STATUS_LABELS] ?? row.timeStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationNote" label="运营备注" min-width="120" />
        <el-table-column v-if="isSuperAdmin" label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.timeStatus >= 1"
              type="warning"
              size="small"
              @click="openIntervene(row)"
            >
              {{ OPERATION_TYPE_LABELS[OperationType.MANUAL_INTERVENTION] }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="OPERATION_TYPE_LABELS[OperationType.MANUAL_INTERVENTION]" width="400px">
      <el-form label-position="top">
        <el-form-item label="备注">
          <el-input v-model="interveneNote" type="textarea" placeholder="介入备注" :rows="3" />
        </el-form-item>
        <el-form-item label="目标状态">
          <el-select v-model="interveneStatus" style="width: 100%">
            <el-option :label="BUG_STATUS_LABELS[BugStatus.COMMUNICATING]" :value="BugStatus.COMMUNICATING" />
            <el-option :label="BUG_STATUS_LABELS[BugStatus.RESOLVED]" :value="BugStatus.RESOLVED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="interveneLoading" @click="handleIntervene">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin {
  max-width: 1000px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
