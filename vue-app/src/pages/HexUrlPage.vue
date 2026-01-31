<script setup>
import { ref, onMounted } from 'vue'
import IOPanel from '../components/IOPanel.vue'
import { useHistory } from '../composables/useHistory.js'

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

function swap() { const t = input.value; input.value = output.value; output.value = t }
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>Hex / URL / Unicode</h1>
      <p>十六进制、URL 编码、Unicode 转义</p>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" inputLabel="输入" outputLabel="输出" @clear="input = ''" @swap="swap">
      <template #config>
        <div class="cc-group">
          <span class="cc-label">操作</span>
          <select class="cc-select" v-model="selected">
            <option>Hex 编码</option><option>Hex 解码</option>
            <option>URL 编码</option><option>URL 解码</option>
            <option>Unicode 编码</option><option>Unicode 解码</option>
          </select>
        </div>
      </template>
      <template #actions>
        <button class="ca-btn primary" @click="run"><span class="btn-text">转换</span></button>
      </template>
    </IOPanel>
  </div>
</template>
