<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import CopyBtn from '../components/CopyBtn.vue'
import JsonTree from '../components/JsonTree.vue'
import CodeEditor from '../components/CodeEditor.vue'
import CodeHighlight from '../components/CodeHighlight.vue'
import { useHistory } from '../composables/useHistory.js'
import { jsonToCode, fileExtMap } from '../composables/useJsonToCode.js'

const { save, getLast } = useHistory('json')

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

watch([codeLang, useCamelCase], generateCode)

function run() {
  error.value = ''; treeData.value = null; isValid.value = null
  if (!input.value.trim()) return
  try {
    switch (selected.value) {
      case '格式化': {
        let raw = input.value.trim()
        try {
          const unescaped = JSON.parse(raw)
          if (typeof unescaped === 'string') {
            try { JSON.parse(unescaped); raw = unescaped } catch {}
          }
        } catch {}
        const parsed = JSON.parse(raw)
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

let editTimer = null
function onInputEdit(val) {
  clearTimeout(editTimer)
  editTimer = setTimeout(() => {
    if (!val.trim()) { isValid.value = null; error.value = ''; codeOutput.value = ''; treeData.value = null; return }
    try {
      const parsed = JSON.parse(val)
      isValid.value = true; error.value = ''; treeData.value = parsed
      save(val); generateCode()
    } catch (e) {
      isValid.value = false; error.value = e.message; codeOutput.value = ''; treeData.value = null
    }
  }, 500)
}
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>JSON 工具</h1>
      <p>格式化 / 压缩 / 校验 / 转义 + 代码生成</p>
    </div>

    <!-- 三栏布局 -->
    <div class="io-layout fade d1">
      <!-- Left: JSON Editor -->
      <div class="io-box">
        <div class="io-top">
          <div class="io-title">
            <div :class="['io-dot', isValid === true ? '!bg-[var(--green)]' : isValid === false ? '!bg-red-500' : '']"></div>
            JSON 内容
          </div>
          <div class="io-btns">
            <CopyBtn :value="input" />
          </div>
        </div>
        <CodeEditor v-model="input" placeholder="输入或粘贴 JSON..." minHeight="calc(100vh - 300px)" @update:modelValue="onInputEdit" />
        <div v-if="isValid === false" class="px-3 py-2 bg-red-500/10 border-t border-red-500/30 text-red-400 text-[12px] mono">
          {{ error }}
        </div>
        <div v-else-if="isValid === true && selected === '校验'" class="px-3 py-2 bg-emerald-500/10 border-t border-emerald-500/30 text-emerald-400 text-[12px] mono">
          JSON 格式校验通过
        </div>
      </div>

      <!-- Center: Config + Actions -->
      <div class="io-center">
        <div class="center-config">
          <div class="cc-group">
            <span class="cc-label">操作</span>
            <select class="cc-select" v-model="selected">
              <option>格式化</option><option>压缩</option><option>校验</option><option>转义</option><option>去转义</option>
            </select>
          </div>
          <div class="cc-group">
            <span class="cc-label">目标语言</span>
            <select class="cc-select" v-model="codeLang">
              <option v-for="lang in codeLangs" :key="lang">{{ lang }}</option>
            </select>
          </div>
          <label v-if="showCamelOption" class="flex items-center gap-1.5 text-[10px] text-[var(--text-2)] cursor-pointer select-none mt-1">
            <input type="checkbox" v-model="useCamelCase" class="!w-3 !h-3 accent-[var(--accent)]" />
            下划线转驼峰
          </label>
        </div>
        <div class="center-actions">
          <button class="ca-btn primary" @click="run"><span class="btn-text">执行</span></button>
          <button v-if="codeOutput" class="ca-btn" @click="downloadCode"><span class="btn-text">下载代码</span></button>
        </div>
      </div>

      <!-- Right: Code Output -->
      <div class="io-box">
        <div class="io-top">
          <div class="io-title"><div class="io-dot out"></div>代码输出 · {{ codeLang }}</div>
          <div class="io-btns">
            <CopyBtn :value="codeOutput" />
          </div>
        </div>
        <div class="flex-1 min-h-0 overflow-auto">
          <CodeHighlight
            v-if="codeOutput"
            :code="codeOutput"
            :language="codeLang"
            minHeight="calc(100vh - 300px)"
          />
          <div v-else class="p-4 flex items-center justify-center text-[var(--text-3)] text-[13px] mono" style="min-height:calc(100vh - 300px)">
            输入有效 JSON 后自动生成代码…
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
