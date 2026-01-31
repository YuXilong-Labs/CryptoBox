<script setup>
import { ref } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import IOPanel from '../components/IOPanel.vue'

const modes = ['Base64 编码', 'Base64 解码', 'Base32 编码', 'Base32 解码']
const selected = ref('Base64 编码')
const input = ref('')
const output = ref('')

const b32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
function b32encode(str) {
  const bytes = new TextEncoder().encode(str)
  let bits = '', r = ''
  for (const b of bytes) bits += b.toString(2).padStart(8, '0')
  while (bits.length % 5) bits += '0'
  for (let i = 0; i < bits.length; i += 5) r += b32chars[parseInt(bits.slice(i, i + 5), 2)]
  while (r.length % 8) r += '='
  return r
}
function b32decode(str) {
  str = str.replace(/=+$/, '')
  let bits = ''
  for (const c of str) { const i = b32chars.indexOf(c.toUpperCase()); if (i >= 0) bits += i.toString(2).padStart(5, '0') }
  const bytes = []
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2))
  return new TextDecoder().decode(new Uint8Array(bytes))
}

function run() {
  try {
    switch (selected.value) {
      case 'Base64 编码': output.value = btoa(unescape(encodeURIComponent(input.value))); break
      case 'Base64 解码': output.value = decodeURIComponent(escape(atob(input.value))); break
      case 'Base32 编码': output.value = b32encode(input.value); break
      case 'Base32 解码': output.value = b32decode(input.value); break
    }
  } catch (e) { output.value = `错误: ${e.message}` }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">&lt;/&gt;</span>
        Base64 / Base32
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">Base64 和 Base32 编解码，支持 UTF-8</p>
    </div>

    <PillGroup :items="modes" v-model="selected" />
    <IOPanel v-model:inputValue="input" :outputValue="output" inputLabel="输入" outputLabel="输出" @clear="input = ''" />

    <div class="flex items-center justify-center mt-5">
      <button class="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer" @click="run">转换</button>
    </div>
  </div>
</template>
