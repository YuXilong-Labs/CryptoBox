<script setup>
import { ref, onMounted } from 'vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'
import CryptoJS from 'crypto-js'
import { useHistory } from '../composables/useHistory.js'

const key = ref('')
const iv = ref('')
const mode = ref('CBC')
const outputFmt = ref('Base64')
const input = ref('')
const output = ref('')
const elapsed = ref(0)
const { save: saveHistory, getLast: getLastInput } = useHistory('blowfish')
onMounted(() => { input.value = getLastInput() })

function randomHex(n) {
  return Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b => b.toString(16).padStart(2,'0')).join('')
}

function run(decrypt = false) {
  try {
    const t0 = performance.now()
    const k = CryptoJS.enc.Hex.parse(key.value)
    const cfg = { mode: CryptoJS.mode[mode.value], padding: CryptoJS.pad.Pkcs7 }
    if (mode.value !== 'ECB') cfg.iv = CryptoJS.enc.Hex.parse(iv.value)
    if (decrypt) {
      let ci = input.value
      if (outputFmt.value === 'Hex') ci = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Hex.parse(input.value) })
      const r = CryptoJS.Blowfish.decrypt(ci, k, cfg)
      output.value = r.toString(CryptoJS.enc.Utf8) || '解密结果为空'
    } else {
      const r = CryptoJS.Blowfish.encrypt(input.value, k, cfg)
      output.value = outputFmt.value === 'Base64' ? r.toString() : r.ciphertext.toString(CryptoJS.enc.Hex)
    }
    elapsed.value = Math.round(performance.now() - t0)
  } catch (e) { output.value = `错误: ${e.message}` }
}

function swap() { const t = input.value; input.value = output.value; output.value = t }
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>Blowfish</h1>
      <p>Blowfish 对称分组加密 (64-bit block)</p>
    </div>

    <div class="key-bar fade d1">
      <div class="key-group">
        <span class="cfg-label">Key</span>
        <div class="key-input-wrap">
          <input class="key-input" v-model="key" placeholder="4-56 bytes hex" />
          <CopyBtn :value="key" class="key-copy-btn" />
        </div>
        <button class="qbtn" @click="key = randomHex(16)">🎲 随机</button>
      </div>
      <div class="key-group" v-if="mode !== 'ECB'">
        <span class="cfg-label">IV</span>
        <div class="key-input-wrap">
          <input class="key-input" v-model="iv" placeholder="8 bytes hex" />
          <CopyBtn :value="iv" class="key-copy-btn" />
        </div>
        <button class="qbtn" @click="iv = randomHex(8)">🎲 随机</button>
      </div>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" :outputMeta="`${elapsed}ms · ${outputFmt} · ${output.length} chars`" @clear="input = ''" @swap="swap">
      <template #config>
        <div class="cc-group">
          <span class="cc-label">模式</span>
          <select class="cc-select" v-model="mode"><option>CBC</option><option>ECB</option></select>
        </div>
        <div class="cc-group">
          <span class="cc-label">输出格式</span>
          <select class="cc-select" v-model="outputFmt"><option>Base64</option><option>Hex</option></select>
        </div>
      </template>
      <template #actions>
        <button class="ca-btn primary" @click="run(false)"><span class="btn-text">加密</span></button>
        <button class="ca-btn" @click="run(true)"><span class="btn-text">解密</span></button>
      </template>
    </IOPanel>
  </div>
</template>
