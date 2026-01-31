<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import CopyBtn from '../components/CopyBtn.vue'
import JsonTree from '../components/JsonTree.vue'
import CodeEditor from '../components/CodeEditor.vue'
import CodeHighlight from '../components/CodeHighlight.vue'
import { useHistory } from '../composables/useHistory.js'
import { jsonToCode, fileExtMap } from '../composables/useJsonToCode.js'

const { save, getLast } = useHistory('json')

const modes = ['格式化', '压缩', '校验', '转义', '去转义']
const selected = ref('格式化')
const input = ref('')
const error = ref('')
const treeData = ref(null)
const isValid = ref(null)

// Code conversion
const codeLangs = [
  'Objective-C', 'Swift', 'Java', 'Kotlin', 'Python', 'JavaScript',
  'TypeScript', 'Go', 'Rust', 'C#', 'PHP', 'Ruby', 'Dart'
]
const codeLang = ref('Objective-C')
const codeOutput = ref('')
const useCamelCase = ref(true)

onMounted(() => {
  const last = getLast()
  if (last) { input.value = last; nextTick(() => run()) }
})

watch(selected, () => { if (input.value.trim()) run() })
watch([codeLang, useCamelCase], generateCode)

function run() {
  error.value = ''; treeData.value = null; isValid.value = null
  if (!input.value.trim()) return
  try {
    switch (selected.value) {
      case '格式化': {
        const parsed = JSON.parse(input.value)
        input.value = JSON.stringify(parsed, null, 2)
        treeData.value = parsed; isValid.value = true; break
      }
      case '压缩': { input.value = JSON.stringify(JSON.parse(input.value)); isValid.value = true; break }
      case '校验': { JSON.parse(input.value); isValid.value = true; break }
      case '转义': { input.value = JSON.stringify(JSON.stringify(JSON.parse(input.value))); isValid.value = true; break }
      case '去转义': {
        const r = JSON.parse(input.value)
        input.value = typeof r === 'string' ? r : JSON.stringify(r, null, 2)
        isValid.value = true; break
      }
    }
    save(input.value); generateCode()
  } catch (e) { error.value = e.message; isValid.value = false; codeOutput.value = '' }
}

function generateCode() {
  if (isValid.value !== true) { codeOutput.value = ''; return }
  try {
    const parsed = JSON.parse(input.value)
    codeOutput.value = jsonToCode(parsed, codeLang.value, useCamelCase.value)
  } catch { codeOutput.value = '' }
}

function downloadCode() {
  if (!codeOutput.value) return
  const ext = fileExtMap[codeLang.value] || '.txt'
  const blob = new Blob([codeOutput.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `Root${ext}`; a.click()
  URL.revokeObjectURL(url)
}

const showCamelOption = computed(() => ['Objective-C', 'Swift'].includes(codeLang.value))
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">{ }</span>
        JSON 工具
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">点击操作按钮即时执行，右侧生成语法高亮代码</p>
    </div>

    <!-- Mode pills -->
    <div class="flex flex-wrap gap-1.5 mb-4">
      <button
        v-for="m in modes" :key="m"
        :class="['px-3 py-1 text-[12px] mono rounded border transition-all duration-150 cursor-pointer',
          selected === m ? 'bg-[var(--accent)] border-[var(--accent)] text-black font-semibold'
            : 'bg-transparent border-[var(--border)] text-[var(--text-2)] hover:border-[var(--text-3)] hover:text-[var(--text)]']"
        @click="selected = m; run()"
      >{{ m }}</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
      <!-- Left: Content -->
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">
          内容 <CopyBtn :value="input" />
        </label>
        <div :class="['flex flex-col rounded overflow-hidden transition-colors duration-200 flex-1',
          isValid === true ? 'border-2 border-emerald-500/60' : isValid === false ? 'border-2 border-red-500/60' : 'border border-[var(--border)]']">
          <div v-if="treeData && selected === '格式化'" class="bg-[var(--bg)] p-4 min-h-[500px] max-h-[700px] overflow-auto mono text-[13px] leading-[1.8] flex-1">
            <JsonTree :data="treeData" :root="true" />
          </div>
          <CodeEditor v-else v-model="input" placeholder='输入或粘贴 JSON...' minHeight="500px" />
          <div v-if="isValid === false" class="px-3 py-2 bg-red-500/10 border-t border-red-500/30 text-red-400 text-[12px] mono">
            ❌ {{ error }}
          </div>
          <div v-else-if="isValid === true && selected === '校验'" class="px-3 py-2 bg-emerald-500/10 border-t border-emerald-500/30 text-emerald-400 text-[12px] mono">
            ✅ JSON 格式校验通过
          </div>
        </div>
      </div>

      <!-- Right: Code -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2 flex-wrap">
          <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">转为代码</label>
          <select v-model="codeLang" class="!w-auto !text-[11px] !py-1 !px-2 !font-sans">
            <option v-for="lang in codeLangs" :key="lang">{{ lang }}</option>
          </select>
          <!-- CamelCase toggle for OC/Swift -->
          <label v-if="showCamelOption" class="flex items-center gap-1.5 text-[11px] text-[var(--text-2)] cursor-pointer select-none">
            <input type="checkbox" v-model="useCamelCase" class="!w-3 !h-3 accent-[var(--accent)]" />
            下划线转驼峰
          </label>
          <div class="flex-1"></div>
          <CopyBtn :value="codeOutput" />
          <button
            v-if="codeOutput"
            class="px-2 py-0.5 text-[11px] border border-[var(--border)] rounded text-[var(--text-3)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer flex items-center gap-1"
            @click="downloadCode"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            下载
          </button>
        </div>
        <div class="border border-[var(--border)] rounded overflow-hidden flex-1">
          <CodeHighlight
            v-if="codeOutput"
            :code="codeOutput"
            :language="codeLang"
            minHeight="500px"
          />
          <div v-else class="p-4 min-h-[500px] flex items-center justify-center text-[var(--text-3)] text-[13px] mono">
            输入有效 JSON 后自动生成代码...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
