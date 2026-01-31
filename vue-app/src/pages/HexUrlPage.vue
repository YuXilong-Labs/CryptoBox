<script setup>
import { ref, onMounted } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import IOPanel from '../components/IOPanel.vue'
import { useHistory } from '../composables/useHistory.js'

const modes = ['Hex 编码', 'Hex 解码', 'URL 编码', 'URL 解码', 'Unicode 编码', 'Unicode 解码']
const selected = ref('Hex 编码')
const { save: saveHistory, getLast: getLastInput } = useHistory('hexurl')
const input = ref('')
onMounted(() => { input.value = getLastInput() })
const output = ref('')

function run() {
  try {
    const v = input.value
    switch (selected.value) {
      case 'Hex 编码': output.value = Array.from(new TextEncoder().encode(v)).map(b => b.toString(16).padStart(2,'0')).join(' '); break
      case 'Hex 解码': output.value = new TextDecoder().decode(new Uint8Array(v.replace(/\s+/g,'').match(/.{2}/g).map(h => parseInt(h,16)))); break
      case 'URL 编码': output.value = encodeURIComponent(v); break
      case 'URL 解码': output.value = decodeURIComponent(v); break
      case 'Unicode 编码': output.value = Array.from(v).map(c => '\\u' + c.codePointAt(0).toString(16).padStart(4,'0')).join(''); break
      case 'Unicode 解码': output.value = v.replace(/\\u([0-9a-fA-F]{4,6})/g, (_, h) => String.fromCodePoint(parseInt(h,16))); break
    }
  } catch (e) { output.value = `错误: ${e.message}` }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">T</span>
        Hex / URL / Unicode
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">十六进制、URL 编码、Unicode 转义</p>
    </div>
    <PillGroup :items="modes" v-model="selected" />
    <IOPanel v-model:inputValue="input" :outputValue="output" inputLabel="输入" outputLabel="输出" @clear="input = ''" />
    <div class="flex items-center justify-center mt-5">
      <button class="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer" @click="run">转换</button>
    </div>
  </div>
</template>
