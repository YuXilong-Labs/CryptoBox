<script setup>
import { ref } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import CopyBtn from '../components/CopyBtn.vue'

const modes = ['格式化', '压缩', '校验', '转义', '去转义']
const selected = ref('格式化')
const input = ref('')
const output = ref('')
const error = ref('')

function run() {
  error.value = ''
  try {
    switch (selected.value) {
      case '格式化': output.value = JSON.stringify(JSON.parse(input.value), null, 2); break
      case '压缩': output.value = JSON.stringify(JSON.parse(input.value)); break
      case '校验': { JSON.parse(input.value); output.value = '✅ 有效的 JSON'; break }
      case '转义': output.value = JSON.stringify(input.value); break
      case '去转义': output.value = JSON.parse(input.value); break
    }
  } catch (e) { error.value = e.message; output.value = '' }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">{ }</span>
        JSON 工具
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">格式化、压缩、校验、转义</p>
    </div>

    <PillGroup :items="modes" v-model="selected" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">输入</label>
        <textarea v-model="input" placeholder='{"key": "value"}' class="!min-h-[200px] !text-[12px]" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">输出 <CopyBtn :value="output" /></label>
        <textarea :value="output" readonly class="!min-h-[200px] !text-[12px] !text-[var(--accent)]" placeholder="结果..." />
      </div>
    </div>

    <div v-if="error" class="text-red-400 text-[12px] mb-3 mono">{{ error }}</div>

    <button class="px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer" @click="run">执行</button>
  </div>
</template>
