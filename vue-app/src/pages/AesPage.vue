<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'
import CryptoJS from 'crypto-js'
import { useHistory } from '../composables/useHistory.js'

const { save: saveHistory, getLast: getLastInput } = useHistory('aes')

const keySize = ref('128')
const mode = ref('CBC')
const padding = ref('Pkcs7')
const outputFmt = ref('Base64')
const key = ref('')
const iv = ref('')
const input = ref('')
const output = ref('')
const elapsed = ref(0)

onMounted(() => { input.value = getLastInput() })

const needsIV = computed(() => mode.value !== 'ECB')

function randomHex(bytes) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map(b => b.toString(16).padStart(2, '0')).join('')
}
function randomKey() { key.value = randomHex(parseInt(keySize.value) / 8) }
function randomIV() { iv.value = randomHex(16) }

function encrypt() {
  try {
    const t0 = performance.now()
    const keyWA = CryptoJS.enc.Hex.parse(key.value)
    const ivWA = needsIV.value ? CryptoJS.enc.Hex.parse(iv.value) : undefined
    const cfg = { mode: CryptoJS.mode[mode.value], padding: CryptoJS.pad[padding.value] }
    if (ivWA) cfg.iv = ivWA
    const encrypted = CryptoJS.AES.encrypt(input.value, keyWA, cfg)
    output.value = outputFmt.value === 'Base64'
      ? encrypted.toString()
      : encrypted.ciphertext.toString(CryptoJS.enc.Hex)
    elapsed.value = Math.round(performance.now() - t0)
    saveHistory(input.value)
  } catch (e) {
    output.value = `错误: ${e.message}`
  }
}

function decrypt() {
  try {
    const t0 = performance.now()
    const keyWA = CryptoJS.enc.Hex.parse(key.value)
    const ivWA = needsIV.value ? CryptoJS.enc.Hex.parse(iv.value) : undefined
    const cfg = { mode: CryptoJS.mode[mode.value], padding: CryptoJS.pad[padding.value] }
    if (ivWA) cfg.iv = ivWA
    let cipherInput = input.value
    if (outputFmt.value === 'Hex') {
      cipherInput = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(input.value)
      })
    }
    const decrypted = CryptoJS.AES.decrypt(cipherInput, keyWA, cfg)
    output.value = decrypted.toString(CryptoJS.enc.Utf8)
    if (!output.value) output.value = '解密结果为空（密钥或 IV 可能不正确）'
    elapsed.value = Math.round(performance.now() - t0)
  } catch (e) {
    output.value = `错误: ${e.message}`
  }
}

function swap() {
  const tmp = input.value
  input.value = output.value
  output.value = tmp
}

const outputMeta = computed(() => {
  const len = output.value ? output.value.length : 0
  return `${elapsed.value}ms · ${outputFmt.value} · ${len} chars`
})
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>AES 加解密</h1>
      <p>高级加密标准 · CBC / ECB / CTR / CFB / OFB</p>
    </div>

    <!-- Key/IV bar -->
    <div class="key-bar fade d1">
      <div class="key-group">
        <span class="cfg-label">Key</span>
        <div class="key-input-wrap">
          <input class="key-input" v-model="key" :placeholder="`${keySize} bit 密钥 (Hex)`" />
          <CopyBtn :value="key" class="key-copy-btn" />
        </div>
        <button class="qbtn" @click="randomKey">🎲 随机</button>
      </div>
      <div class="key-group" v-if="needsIV">
        <span class="cfg-label">IV</span>
        <div class="key-input-wrap">
          <input class="key-input" v-model="iv" placeholder="16 bytes (Hex)" />
          <CopyBtn :value="iv" class="key-copy-btn" />
        </div>
        <button class="qbtn" @click="randomIV">🎲 随机</button>
      </div>
    </div>

    <IOPanel
      v-model:inputValue="input"
      :outputValue="output"
      :outputMeta="outputMeta"
      @clear="input = ''"
      @swap="swap"
    >
      <template #config>
        <div class="cc-group">
          <span class="cc-label">密钥长度</span>
          <select class="cc-select" v-model="keySize">
            <option value="128">128 bit</option>
            <option value="192">192 bit</option>
            <option value="256">256 bit</option>
          </select>
        </div>
        <div class="cc-group">
          <span class="cc-label">模式</span>
          <select class="cc-select" v-model="mode">
            <option>CBC</option><option>ECB</option><option>CTR</option><option>CFB</option><option>OFB</option>
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
        <button class="ca-btn primary" @click="encrypt"><span class="btn-text">加密</span></button>
        <button class="ca-btn" @click="decrypt"><span class="btn-text">解密</span></button>
      </template>
    </IOPanel>
  </div>
</template>
