<script setup>
import { ref, computed, onMounted } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import CopyBtn from '../components/CopyBtn.vue'
import JsonTree from '../components/JsonTree.vue'
import CodeEditor from '../components/CodeEditor.vue'
import { useHistory } from '../composables/useHistory.js'

const { save, getLast } = useHistory('json')

const modes = ['格式化', '压缩', '校验', '转义', '去转义']
const selected = ref('格式化')
const input = ref('')
const output = ref('')
const error = ref('')
const treeData = ref(null)

onMounted(() => { input.value = getLast() })

function run() {
  error.value = ''
  treeData.value = null
  try {
    switch (selected.value) {
      case '格式化': {
        const parsed = JSON.parse(input.value)
        output.value = JSON.stringify(parsed, null, 2)
        treeData.value = parsed
        break
      }
      case '压缩': output.value = JSON.stringify(JSON.parse(input.value)); break
      case '校验': { JSON.parse(input.value); output.value = '✅ 有效的 JSON'; break }
      case '转义': {
        const compressed = JSON.stringify(JSON.parse(input.value))
        output.value = JSON.stringify(compressed)
        break
      }
      case '去转义': output.value = JSON.parse(input.value); break
    }
    save(input.value)
  } catch (e) { error.value = e.message; output.value = '' }
}

const showTree = computed(() => selected.value === '格式化' && treeData.value !== null)
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">{ }</span>
        JSON 工具
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">格式化（树形折叠）、压缩、校验、转义（先压缩再转义）</p>
    </div>

    <PillGroup :items="modes" v-model="selected" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">输入</label>
        <CodeEditor v-model="input" placeholder='{"key": "value"}' minHeight="480px" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">
          输出
          <CopyBtn :value="output" />
        </label>
        <!-- Tree view for 格式化 -->
        <div v-if="showTree" class="border border-[var(--border)] rounded bg-[var(--bg)] p-4 min-h-[480px] max-h-[700px] overflow-auto mono text-[13px] leading-[1.8]">
          <JsonTree :data="treeData" :root="true" />
        </div>
        <!-- Text output with line numbers -->
        <CodeEditor v-else :modelValue="output" :readonly="true" placeholder="结果..." minHeight="480px" textClass="!text-[var(--accent)]" />
      </div>
    </div>

    <div v-if="error" class="text-red-400 text-[12px] mb-3 mono">{{ error }}</div>

    <button class="px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer" @click="run">执行</button>
  </div>
</template>
