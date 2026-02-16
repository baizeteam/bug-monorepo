<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { BUG_STATUS_LABELS } from '@bug/shared'
import { BugStatus } from '@bug/shared'
import {
  getTimeRules,
  createTimeRule,
  updateTimeRule,
  updateTimeRuleEnable,
  type TimeRuleItem,
} from '../api/admin'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

const auth = useAuthStore()
const isSuperAdmin = computed(() => auth.isSuperAdmin)

const list = ref<TimeRuleItem[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)
const form = ref({
  ruleName: '',
  statusType: BugStatus.TAKEN,
  warnHour: 24,
  expireHour: 72,
})
const submitLoading = ref(false)

const statusTypeOptions = [
  { label: BUG_STATUS_LABELS[BugStatus.TAKEN], value: BugStatus.TAKEN },
  { label: BUG_STATUS_LABELS[BugStatus.COMMUNICATING], value: BugStatus.COMMUNICATING },
]

async function load() {
  loading.value = true
  try {
    list.value = await getTimeRules()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogMode.value = 'create'
  editingId.value = null
  form.value = {
    ruleName: '',
    statusType: BugStatus.TAKEN,
    warnHour: 24,
    expireHour: 72,
  }
  dialogVisible.value = true
}

function openEdit(row: TimeRuleItem) {
  dialogMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    ruleName: row.ruleName,
    statusType: row.statusType,
    warnHour: row.warnHour,
    expireHour: row.expireHour,
  }
  dialogVisible.value = true
}

async function submit() {
  if (!form.value.ruleName.trim()) {
    ElMessage.warning('请输入规则名称')
    return
  }
  if (form.value.warnHour >= form.value.expireHour) {
    ElMessage.warning('预警时长应小于超期时长')
    return
  }
  submitLoading.value = true
  try {
    if (dialogMode.value === 'create') {
      await createTimeRule(form.value)
      ElMessage.success('创建成功')
    } else if (editingId.value != null) {
      await updateTimeRule(editingId.value, form.value)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    load()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '操作失败')
  } finally {
    submitLoading.value = false
  }
}

async function toggleEnable(row: TimeRuleItem) {
  try {
    const next = row.isEnable === 1 ? 0 : 1
    await updateTimeRuleEnable(row.id, next as 0 | 1)
    ElMessage.success(next === 1 ? '已启用' : '已禁用')
    load()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '操作失败')
  }
}

function statusTypeLabel(statusType: number) {
  return BUG_STATUS_LABELS[statusType as keyof typeof BUG_STATUS_LABELS] ?? statusType
}

onMounted(load)
</script>

<template>
  <div class="time-rules">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>时效规则配置</span>
          <el-button v-if="isSuperAdmin" type="primary" @click="openCreate">新增规则</el-button>
        </div>
      </template>
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="ruleName" label="规则名称" min-width="140" />
        <el-table-column label="关联状态" width="100">
          <template #default="{ row }">
            {{ statusTypeLabel(row.statusType) }}
          </template>
        </el-table-column>
        <el-table-column prop="warnHour" label="预警(小时)" width="100" />
        <el-table-column prop="expireHour" label="超期(小时)" width="100" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isEnable === 1 ? 'success' : 'info'" size="small">
              {{ row.isEnable === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="170" />
        <el-table-column v-if="isSuperAdmin" label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="warning" link size="small" @click="toggleEnable(row)">
              {{ row.isEnable === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && list.length === 0" description="暂无规则，可点击「新增规则」创建" />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增时效规则' : '编辑时效规则'"
      width="420px"
    >
      <el-form label-width="100px">
        <el-form-item label="规则名称" required>
          <el-input v-model="form.ruleName" placeholder="如：承接后超期规则" />
        </el-form-item>
        <el-form-item label="关联状态" required>
          <el-select v-model="form.statusType" style="width: 100%">
            <el-option
              v-for="opt in statusTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预警时长(小时)" required>
          <el-input-number v-model="form.warnHour" :min="1" :max="8760" />
        </el-form-item>
        <el-form-item label="超期时长(小时)" required>
          <el-input-number v-model="form.expireHour" :min="1" :max="8760" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.time-rules {
  max-width: 900px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
