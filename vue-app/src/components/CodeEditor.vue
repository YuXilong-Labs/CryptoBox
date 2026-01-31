<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  minHeight: { type: String, default: '480px' },
  textClass: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
const textarea = ref(null)
const lineNums = ref(null)

const lines = computed(() => {
  const text = props.modelValue || ''
  const count = text ? text.split('\n').length : 1
  return Array.from({ length: count }, (_, i) => i + 1)
})

function syncScroll() {
  if (lineNums.value && textarea.value) {
    lineNums.value.scrollTop = textarea.value.scrollTop
  }
}

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <div class="flex border border-[var(--border)] rounded bg-[var(--bg)] overflow-hidden" :style="{ minHeight }">
    <!-- Line numbers -->
    <div
      ref="lineNums"
      class="shrink-0 py-3 px-2 text-right select-none overflow-hidden bg-[var(--bg-1)] border-r border-[var(--border)]"
      :style="{ minHeight }"
    >
      <div
        v-for="n in lines"
        :key="n"
        class="mono text-[12px] leading-[1.5] text-[var(--text-3)] h-[18px]"
      >{{ n }}</div>
    </div>
    <!-- Textarea -->
    <textarea
      ref="textarea"
      :value="modelValue"
      @input="onInput"
      @scroll="syncScroll"
      :placeholder="placeholder"
      :readonly="readonly"
      :class="[
        '!border-none !rounded-none flex-1 p-3 !bg-transparent resize-none outline-none mono text-[13px] leading-[1.5]',
        textClass
      ]"
      :style="{ minHeight }"
      spellcheck="false"
    />
  </div>
</template>
