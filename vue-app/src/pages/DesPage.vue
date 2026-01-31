<script setup>
import { ref, computed, onMounted } from 'vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'
import CryptoJS from 'crypto-js'
import { useHistory } from '../composables/useHistory.js'

const { save: saveHistory, getLast: getLastInput } = useHistory('des')

const algo = ref('DES')
const modeStr = ref('CBC')
const padding = ref('Pkcs7')
const outputFmt = ref('Base64')
const key = ref('')
const iv = ref('')
const input = ref('')
const output = ref('')
const elapsed = ref(0)

onMounted(() => { input.value = getLastInput() })
const needsIV = computed(() => modeStr.value !== 'ECB')

function randomHex(n) {
  return Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b => b.toString(16).padStart(2,'0')).join('')
}
function randomKey() { key.value = randomHex(algo.value === 'TripleDES' ? 24 : 8) }
function randomIV() { iv.value = randomHex(8) }

function run(decrypt = false) {
  try {
    const t0 = performance.now()
    const k = CryptoJS.enc.Hex.parse(key.value)
    const cfg = { mode: CryptoJS.mode[modeStr.value], padding: CryptoJS.pad[padding.value] }
    if (needsIV.value) cfg.iv = CryptoJS.enc.Hex.parse(iv.value)
    const fn = CryptoJS[algo.value]
    if (decrypt) {
      let ci = input.value
      if (outputFmt.value === 'Hex') ci = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Hex.parse(input.value) })
      const r = fn.decrypt(ci, k, cfg)
      output.value = r.toString(CryptoJS.enc.Utf8) || '解密结果为空'
    } else {
      const r = fn.encrypt(input.value, k, cfg)
      output.value = outputFmt.value === 'Base64' ? r.toString() : r.ciphertext.toString(CryptoJS.enc.Hex)
    }
    elapsed.value = Math.round(performance.now() - t0); saveHistory(input.value)
  } catch (e) { output.value = `错误: ${e.message}` }
}

function swap() { const t = input.value; input.value = output.value; output.value = t }
const meta = computed(() => `${elapsed.value}ms · ${outputFmt.value} · ${output.value.length} chars`)
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>DES / 3DES 加解密</h1>
      <p>Data Encryption Standard — DES (64-bit) 和 Triple DES (192-bit)</p>
    </div>

    <div class="key-bar fade d1">
      <div class="key-group">
        <span class="cfg-label">Key</span>
        <div class="key-input-wrap">
          <input class="key-input" v-model="key" :placeholder="algo === 'TripleDES' ? '24 bytes hex' : '8 bytes hex'" />
          <CopyBtn :value="key" class="key-copy-btn" />
        </div>
        <button class="qbtn" @click="randomKey">🎲 随机</button>
      </div>
      <div class="key-group" v-if="needsIV">
        <span class="cfg-label">IV</span>
        <div class="key-input-wrap">
          <input class="key-input" v-model="iv" placeholder="8 bytes hex" />
          <CopyBtn :value="iv" class="key-copy-btn" />
        </div>
        <button class="qbtn" @click="randomIV">🎲 随机</button>
      </div>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" :outputMeta="meta" @clear="input = ''" @swap="swap">
      <template #config>
        <div class="cc-group">
          <span class="cc-label">算法</span>
          <select class="cc-select" v-model="algo">
            <option value="DES">DES</option><option value="TripleDES">3DES</option>
          </select>
        </div>
        <div class="cc-group">
          <span class="cc-label">模式</span>
          <select class="cc-select" v-model="modeStr">
            <option>CBC</option><option>ECB</option>
          </select>
        </div>
        <div class="cc-group">
          <span class="cc-label">填充</span>
          <select class="cc-select" v-model="padding">
            <option value="Pkcs7">PKCS7</option><option value="ZeroPadding">Zero</option><option value="NoPadding">None</option>
          </select>
        </div>
        <div class="cc-group">
          <span class="cc-label">输出格式</span>
          <select class="cc-select" v-model="outputFmt">
            <option>Base64</option><option>Hex</option>
          </select>
        </div>
      </template>
      <template #actions>
        <button class="ca-btn primary" @click="run(false)"><span class="btn-text">加密</span></button>
        <button class="ca-btn" @click="run(true)"><span class="btn-text">解密</span></button>
      </template>
    </IOPanel>
  </div>
</template>
