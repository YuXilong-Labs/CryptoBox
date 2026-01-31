<script setup>
import { ref, onMounted } from 'vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'
import { useHistory } from '../composables/useHistory.js'

const key = ref('')
const nonce = ref('')
const input = ref('')
const output = ref('')
const elapsed = ref(0)
const { save: saveHistory, getLast: getLastInput } = useHistory('chacha20')
onMounted(() => { input.value = getLastInput() })

function randomHex(n) {
  return Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b => b.toString(16).padStart(2,'0')).join('')
}
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) bytes[i/2] = parseInt(hex.substr(i,2), 16)
  return bytes
}

function quarterRound(s, a, b, c, d) {
  s[a] = (s[a] + s[b]) >>> 0; s[d] ^= s[a]; s[d] = (s[d] << 16) | (s[d] >>> 16)
  s[c] = (s[c] + s[d]) >>> 0; s[b] ^= s[c]; s[b] = (s[b] << 12) | (s[b] >>> 20)
  s[a] = (s[a] + s[b]) >>> 0; s[d] ^= s[a]; s[d] = (s[d] << 8)  | (s[d] >>> 24)
  s[c] = (s[c] + s[d]) >>> 0; s[b] ^= s[c]; s[b] = (s[b] << 7)  | (s[b] >>> 25)
}

function chacha20Block(key32, counter, nonce12) {
  const constants = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]
  const kw = new Uint32Array(key32.buffer)
  const nw = new Uint32Array(nonce12.buffer)
  const state = new Uint32Array([...constants, ...kw, counter, ...nw])
  const working = new Uint32Array(state)
  for (let i = 0; i < 10; i++) {
    quarterRound(working,0,4,8,12); quarterRound(working,1,5,9,13)
    quarterRound(working,2,6,10,14); quarterRound(working,3,7,11,15)
    quarterRound(working,0,5,10,15); quarterRound(working,1,6,11,12)
    quarterRound(working,2,7,8,13); quarterRound(working,3,4,9,14)
  }
  const out = new Uint32Array(16)
  for (let i = 0; i < 16; i++) out[i] = (working[i] + state[i]) >>> 0
  return new Uint8Array(out.buffer)
}

function chacha20(keyHex, nonceHex, data) {
  const keyBytes = hexToBytes(keyHex)
  const nonceBytes = hexToBytes(nonceHex)
  const result = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i += 64) {
    const block = chacha20Block(keyBytes, Math.floor(i / 64), nonceBytes)
    for (let j = 0; j < 64 && i + j < data.length; j++) result[i + j] = data[i + j] ^ block[j]
  }
  return result
}

function encrypt() {
  try {
    const t0 = performance.now()
    const data = new TextEncoder().encode(input.value)
    const enc = chacha20(key.value, nonce.value, data)
    output.value = Array.from(enc).map(b => b.toString(16).padStart(2,'0')).join('')
    elapsed.value = Math.round(performance.now() - t0)
  } catch (e) { output.value = `错误: ${e.message}` }
}

function decrypt() {
  try {
    const t0 = performance.now()
    const data = hexToBytes(input.value)
    const dec = chacha20(key.value, nonce.value, data)
    output.value = new TextDecoder().decode(dec)
    elapsed.value = Math.round(performance.now() - t0)
  } catch (e) { output.value = `错误: ${e.message}` }
}

function swap() { const t = input.value; input.value = output.value; output.value = t }
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>ChaCha20</h1>
      <p>ChaCha20 流加密 — 256-bit key, 96-bit nonce</p>
    </div>

    <div class="key-bar fade d1">
      <div class="key-group">
        <span class="cfg-label">Key</span>
        <div class="key-input-wrap">
          <input class="key-input" v-model="key" placeholder="32 bytes hex (64 chars)" />
          <CopyBtn :value="key" class="key-copy-btn" />
        </div>
        <button class="qbtn" @click="key = randomHex(32)">🎲 随机</button>
      </div>
      <div class="key-group">
        <span class="cfg-label">Nonce</span>
        <div class="key-input-wrap">
          <input class="key-input" v-model="nonce" placeholder="12 bytes hex (24 chars)" />
          <CopyBtn :value="nonce" class="key-copy-btn" />
        </div>
        <button class="qbtn" @click="nonce = randomHex(12)">🎲 随机</button>
      </div>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" inputLabel="输入 · 明文/Hex密文" :outputMeta="`${elapsed}ms · Hex · ${output.length} chars`" @clear="input = ''" @swap="swap">
      <template #config>
        <div class="cc-group">
          <span class="cc-label" style="font-size:11px;letter-spacing:0">输出为 Hex 编码</span>
        </div>
      </template>
      <template #actions>
        <button class="ca-btn primary" @click="encrypt"><span class="btn-text">加密</span></button>
        <button class="ca-btn" @click="decrypt"><span class="btn-text">解密</span></button>
      </template>
    </IOPanel>
  </div>
</template>
