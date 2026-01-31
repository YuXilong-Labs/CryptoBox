<script setup>
import { ref } from 'vue'

const props = defineProps({ value: String })
const copied = ref(false)

function copy() {
  if (!props.value) return
  const ta = document.createElement('textarea')
  ta.value = props.value
  ta.style.cssText = 'position:fixed;left:-9999px;opacity:0'
  document.body.appendChild(ta)
  ta.select()
  try { document.execCommand('copy') } catch {}
  document.body.removeChild(ta)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <button
    class="p-1 text-[var(--text-3)] hover:text-[var(--accent)] transition-colors"
    :class="{ '!text-[var(--accent)]': copied }"
    @click.stop="copy"
    title="复制"
  >
    <!-- Copy icon -->
    <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
    <!-- Check icon -->
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
  </button>
</template>
