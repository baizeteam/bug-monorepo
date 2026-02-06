<script setup lang="ts">
import { ref, onBeforeUnmount, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { Editor, Toolbar } from '@wangeditor-next/editor-for-vue'
import '@wangeditor-next/editor/dist/css/style.css'
import { createBug } from '../api/bug'

const router = useRouter()
const form = ref({
  title: '',
  techStack: '',
  description: '',
  expectEffect: '',
  communityInfo: '',
})
const loading = ref(false)
const error = ref('')

const editorRef = shallowRef()
const toolbarConfig = {}
const editorConfig = { placeholder: '请详细描述问题（支持富文本）' }

function handleCreated(editor: { destroy: () => void }) {
  editorRef.value = editor
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

async function handleSubmit() {
  error.value = ''
  if (!form.value.title || !form.value.techStack || !form.value.description || !form.value.expectEffect) {
    error.value = '请填写必填项'
    return
  }
  loading.value = true
  try {
    const bug = await createBug(form.value)
    router.push(`/bug/${bug.id}`)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '发布失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="create-bug">
    <h1>发布 Bug</h1>
    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label>标题 *</label>
        <input v-model="form.title" placeholder="Bug 标题" maxlength="50" />
      </div>
      <div class="field">
        <label>技术栈 *</label>
        <input v-model="form.techStack" placeholder="如 Vue3、NestJS" />
      </div>
      <div class="field">
        <label>问题描述 *（富文本）</label>
        <div class="editor-wrap">
          <Toolbar
            class="editor-toolbar"
            :editor="editorRef"
            :default-config="toolbarConfig"
            mode="simple"
          />
          <Editor
            class="editor-body"
            v-model="form.description"
            :default-config="editorConfig"
            mode="simple"
            @on-created="handleCreated"
          />
        </div>
      </div>
      <div class="field">
        <label>预期效果 *</label>
        <input v-model="form.expectEffect" placeholder="期望达到的效果" maxlength="500" />
      </div>
      <div class="field">
        <label>社群对接信息（可选）</label>
        <input v-model="form.communityInfo" placeholder="群号/对接专员" />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="loading">{{ loading ? '发布中...' : '发布' }}</button>
    </form>
  </div>
</template>

<style scoped>
.create-bug {
  max-width: 100%;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.create-bug h1 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}
.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  color: #666;
}
.field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}
.editor-wrap {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}
.editor-toolbar {
  border-bottom: 1px solid #ddd;
}
.editor-body {
  min-height: 200px;
}
:deep(.w-e-text-container) {
  background: #fff;
}
.create-bug .error {
  color: #f56c6c;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}
.create-bug button {
  width: 100%;
  padding: 0.6rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
}
</style>
