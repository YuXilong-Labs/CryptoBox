<script setup>
import { ref, watch, onMounted } from 'vue'
import CopyBtn from '../components/CopyBtn.vue'
import CryptoJS from 'crypto-js'
import { useHistory } from '../composables/useHistory.js'

const input = ref('')
const outputFmt = ref('hex')
const { save: saveHistory, getLast: getLastInput } = useHistory('hash')

const algos = [
  { name: 'MD5', fn: (t) => CryptoJS.MD5(t) },
  { name: 'SHA-1', fn: (t) => CryptoJS.SHA1(t) },
  { name: 'SHA-256', fn: (t) => CryptoJS.SHA256(t) },
  { name: 'SHA-512', fn: (t) => CryptoJS.SHA512(t) },
  { name: 'SHA-3 (256)', fn: (t) => CryptoJS.SHA3(t, { outputLength: 256 }) },
  { name: 'SHA-3 (512)', fn: (t) => CryptoJS.SHA3(t, { outputLength: 512 }) },
  { name: 'RIPEMD-160', fn: (t) => CryptoJS.RIPEMD160(t) },
]

onMounted(() => { input.value = getLastInput() })
const results = ref(algos.map(a => ({ name: a.name, value: '' })))

function compute() {
  results.value = algos.map(a => {
    try {
      const h = a.fn(input.value)
      return { name: a.name, value: outputFmt.value === 'base64' ? h.toString(CryptoJS.enc.Base64) : h.toString() }
    } catch { return { name: a.name, value: '不可用' } }
  })
}

watch([input, outputFmt], compute)
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>Hash 通用</h1>
      <p>MD5、SHA-1/256/512、SHA-3、RIPEMD-160 — 实时计算</p>
    </div>

    <div class="mb-4">
      <div class="flex items-center gap-3 mb-2">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">输入文本</label>
        <select v-model="outputFmt" class="!w-auto !text-[11px] !py-1 !px-2">
          <option value="hex">Hex</option>
          <option value="base64">Base64</option>
        </select>
      </div>
      <textarea v-model="input" placeholder="输入要计算哈希的文本..." class="!min-h-[100px]" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
      <div
        v-for="r in results"
        :key="r.name"
        class="flex items-center gap-3 px-3 py-2.5 border border-[var(--border)] rounded bg-[var(--bg-0)]"
      >
        <span class="mono text-[11px] font-semibold text-[var(--text-2)] min-w-[80px]">{{ r.name }}</span>
        <input :value="r.value" readonly class="!border-none !bg-transparent !p-0 !text-[11px] flex-1" />
        <CopyBtn :value="r.value" />
      </div>
    </div>
  </div>
</template>
