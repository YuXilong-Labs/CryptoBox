<script setup>
import { ref } from 'vue'

const props = defineProps({
  inputLabel: { type: String, default: '输入 (明文)' },
  outputLabel: { type: String, default: '输出 (密文)' },
  inputValue: { type: String, default: '' },
  outputValue: { type: String, default: '' },
  outputMeta: { type: String, default: '' },
  inputPlaceholder: { type: String, default: '在此输入要加密的内容...' },
  outputPlaceholder: { type: String, default: '点击操作按钮执行，结果将显示在这里' },
  inputTabs: { type: Array, default: () => ['UTF-8', 'Hex', 'Base64'] },
})

const emit = defineEmits(['update:inputValue', 'paste', 'clear', 'copy', 'save'])
const activeTab = ref('UTF-8')
const copyOk = ref(false)
const pasteOk = ref(false)

async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText()
    emit('update:inputValue', text)
    pasteOk.value = true
    setTimeout(() => pasteOk.value = false, 1500)
  } catch {
    emit('paste')
  }
}

function doCopy(val) {
  if (!val) return
  const ta = document.createElement('textarea')
  ta.value = val
  ta.style.cssText = 'position:fixed;left:-9999px;opacity:0'
  document.body.appendChild(ta)
  ta.select()
  ta.setSelectionRange(0, ta.value.length)
  try { document.execCommand('copy') } catch {}
  document.body.removeChild(ta)
}

function copyOutput() {
  doCopy(props.outputValue)
  copyOk.value = true
  setTimeout(() => copyOk.value = false, 1500)
  emit('copy')
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Input -->
    <div class="border border-[var(--border)] rounded-md bg-[var(--bg-1)] overflow-hidden">
      <div class="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] text-[12px]">
        <span class="text-[var(--text-2)] flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
          {{ inputLabel }}
        </span>
        <div class="flex gap-1">
          <button :class="['px-2 py-0.5 text-[11px] border rounded transition-colors', pasteOk ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-3)] hover:border-[var(--accent)] hover:text-[var(--accent)]']" @click="handlePaste">{{ pasteOk ? '✓ 已粘贴' : '粘贴' }}</button>
          <button class="px-2 py-0.5 text-[11px] border border-[var(--border)] rounded text-[var(--text-3)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors" @click="$emit('clear')">清空</button>
        </div>
      </div>
      <textarea
        :value="inputValue"
        @input="$emit('update:inputValue', $event.target.value)"
        :placeholder="inputPlaceholder"
        class="!border-none !rounded-none !bg-transparent p-3"
      />
      <div class="flex items-center gap-2 px-3 py-1.5 border-t border-[var(--border)] text-[11px] text-[var(--text-3)]">
        <span
          v-for="tab in inputTabs"
          :key="tab"
          :class="['cursor-pointer pb-px border-b', activeTab === tab ? 'text-[var(--accent)] border-[var(--accent)]' : 'border-transparent']"
          @click="activeTab = tab"
        >{{ tab }}</span>
      </div>
    </div>

    <!-- Output -->
    <div class="border border-[var(--border)] rounded-md bg-[var(--bg-1)] overflow-hidden">
      <div class="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] text-[12px]">
        <span class="text-[var(--text-2)] flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
          {{ outputLabel }}
        </span>
        <div class="flex gap-1">
          <button :class="['px-2 py-0.5 text-[11px] border rounded transition-colors', copyOk ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-3)] hover:border-[var(--accent)] hover:text-[var(--accent)]']" @click="copyOutput">{{ copyOk ? '✓ 已复制' : '复制' }}</button>
          <button class="px-2 py-0.5 text-[11px] border border-[var(--border)] rounded text-[var(--text-3)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors" @click="$emit('save')">保存</button>
        </div>
      </div>
      <div class="p-3 min-h-[160px] mono text-[13px] whitespace-pre-wrap break-all" :class="outputValue ? 'text-[var(--text)]' : 'text-[var(--accent)] opacity-60'">
        {{ outputValue || outputPlaceholder }}
      </div>
      <div v-if="outputMeta" class="px-3 py-1.5 border-t border-[var(--border)] text-[11px] text-[var(--text-3)]">
        {{ outputMeta }}
      </div>
    </div>
  </div>
</template>
