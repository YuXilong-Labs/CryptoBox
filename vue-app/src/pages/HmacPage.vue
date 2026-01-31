<script setup>
import { ref, computed } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import CopyBtn from '../components/CopyBtn.vue'
import CryptoJS from 'crypto-js'

const algos = ['HMAC-MD5', 'HMAC-SHA1', 'HMAC-SHA256', 'HMAC-SHA512']
const selected = ref('HMAC-SHA256')
const input = ref('')
const key = ref('')
const output = ref('')
const outputFmt = ref('hex')

function compute() {
  if (!input.value || !key.value) { output.value = ''; return }
  const map = { 'HMAC-MD5': CryptoJS.HmacMD5, 'HMAC-SHA1': CryptoJS.HmacSHA1, 'HMAC-SHA256': CryptoJS.HmacSHA256, 'HMAC-SHA512': CryptoJS.HmacSHA512 }
  try {
    const h = map[selected.value](input.value, key.value)
    output.value = outputFmt.value === 'base64' ? h.toString(CryptoJS.enc.Base64) : h.toString()
  } catch (e) { output.value = `错误: ${e.message}` }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">#</span>
        HMAC
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">Hash-based Message Authentication Code</p>
    </div>

    <PillGroup :items="algos" v-model="selected" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">密钥</label>
        <input v-model="key" placeholder="HMAC 密钥" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">输出格式</label>
        <select v-model="outputFmt"><option value="hex">Hex</option><option value="base64">Base64</option></select>
      </div>
    </div>

    <div class="mb-4">
      <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium mb-1 block">输入</label>
      <textarea v-model="input" placeholder="输入文本..." class="!min-h-[100px]" />
    </div>

    <button class="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer mb-4" @click="compute">计算 HMAC</button>

    <div v-if="output" class="flex items-center gap-3 px-3 py-2.5 border border-[var(--border)] rounded bg-[var(--bg)]">
      <span class="mono text-[11px] font-semibold text-[var(--text-2)] min-w-[60px]">结果</span>
      <input :value="output" readonly class="!border-none !bg-transparent !p-0 !text-[12px] flex-1 mono" />
      <CopyBtn :value="output" />
    </div>
  </div>
</template>
