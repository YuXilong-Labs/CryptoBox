<script setup>
import { ref, onMounted } from 'vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'
import CryptoJS from 'crypto-js'
import { useHistory } from '../composables/useHistory.js'

const key = ref('')
const outputFmt = ref('Base64')
const input = ref('')
const output = ref('')
const elapsed = ref(0)
const { save: saveHistory, getLast: getLastInput } = useHistory('rc4')
onMounted(() => { input.value = getLastInput() })

function randomHex(n) {
  return Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b => b.toString(16).padStart(2,'0')).join('')
}

function encrypt() {
  try {
    const t0 = performance.now()
    const k = CryptoJS.enc.Hex.parse(key.value)
    const r = CryptoJS.RC4.encrypt(input.value, k)
    output.value = outputFmt.value === 'Base64' ? r.toString() : r.ciphertext.toString(CryptoJS.enc.Hex)
    elapsed.value = Math.round(performance.now() - t0)
  } catch (e) { output.value = `错误: ${e.message}` }
}

function decrypt() {
  try {
    const t0 = performance.now()
    const k = CryptoJS.enc.Hex.parse(key.value)
    let ci = input.value
    if (outputFmt.value === 'Hex') ci = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Hex.parse(input.value) })
    const r = CryptoJS.RC4.decrypt(ci, k)
    output.value = r.toString(CryptoJS.enc.Utf8) || '解密结果为空'
    elapsed.value = Math.round(performance.now() - t0)
  } catch (e) { output.value = `错误: ${e.message}` }
}

function swap() { const t = input.value; input.value = output.value; output.value = t }
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>RC4 流加密</h1>
      <p>RC4 (Rivest Cipher 4) 流密码，密钥长度灵活</p>
    </div>

    <div class="key-bar fade d1">
      <div class="key-group">
        <span class="cfg-label">Key</span>
        <div class="key-input-wrap">
          <input class="key-input" v-model="key" placeholder="输入密钥 hex" />
          <CopyBtn :value="key" class="key-copy-btn" />
        </div>
        <button class="qbtn" @click="key = randomHex(16)">🎲 128bit</button>
        <button class="qbtn" @click="key = randomHex(32)">🎲 256bit</button>
      </div>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" :outputMeta="`${elapsed}ms · ${outputFmt} · ${output.length} chars`" @clear="input = ''" @swap="swap">
      <template #config>
        <div class="cc-group">
          <span class="cc-label">输出格式</span>
          <select class="cc-select" v-model="outputFmt"><option>Base64</option><option>Hex</option></select>
        </div>
      </template>
      <template #actions>
        <button class="ca-btn primary" @click="encrypt"><span class="btn-text">加密</span></button>
        <button class="ca-btn" @click="decrypt"><span class="btn-text">解密</span></button>
      </template>
    </IOPanel>
  </div>
</template>
