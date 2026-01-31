<script setup>
import { ref, onMounted } from 'vue'
import IOPanel from '../components/IOPanel.vue'
import { useHistory } from '../composables/useHistory.js'

const selected = ref('Base64 编码')
const { save: saveHistory, getLast: getLastInput } = useHistory('base64')
const input = ref('')
onMounted(() => { input.value = getLastInput() })
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
    saveHistory(input.value)
  } catch (e) { output.value = `错误: ${e.message}` }
}

function swap() { const t = input.value; input.value = output.value; output.value = t }
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>Base64 / Base32</h1>
      <p>Base64 和 Base32 编解码，支持 UTF-8</p>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" inputLabel="输入" outputLabel="输出" @clear="input = ''" @swap="swap">
      <template #config>
        <div class="cc-group">
          <span class="cc-label">操作</span>
          <select class="cc-select" v-model="selected">
            <option>Base64 编码</option><option>Base64 解码</option>
            <option>Base32 编码</option><option>Base32 解码</option>
          </select>
        </div>
      </template>
      <template #actions>
        <button class="ca-btn primary" @click="run"><span class="btn-text">转换</span></button>
      </template>
    </IOPanel>
  </div>
</template>
