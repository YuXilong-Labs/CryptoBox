<script setup>
import { ref } from 'vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'

const key = ref('')
const nonce = ref('')
const input = ref('')
const output = ref('')
const elapsed = ref(0)

function randomHex(n) {
  return Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b => b.toString(16).padStart(2,'0')).join('')
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) bytes[i/2] = parseInt(hex.substr(i,2), 16)
  return bytes
}

// ChaCha20 quarter round
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
    for (let j = 0; j < 64 && i + j < data.length; j++) {
      result[i + j] = data[i + j] ^ block[j]
    }
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
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">⚡</span>
        ChaCha20
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">ChaCha20 流加密 — 256-bit key, 96-bit nonce</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">KEY (256-bit Hex)</label>
        <div class="relative flex items-center">
          <input v-model="key" placeholder="32 bytes hex (64 chars)" class="!pr-8" />
          <CopyBtn :value="key" class="absolute right-1.5" />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">NONCE (96-bit Hex)</label>
        <div class="relative flex items-center">
          <input v-model="nonce" placeholder="12 bytes hex (24 chars)" class="!pr-8" />
          <CopyBtn :value="nonce" class="absolute right-1.5" />
        </div>
      </div>
    </div>

    <div class="flex gap-2 mb-4">
      <button class="px-3 py-1.5 text-[12px] border border-[var(--border)] rounded text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer" @click="key = randomHex(32)">↻ 随机 Key</button>
      <button class="px-3 py-1.5 text-[12px] border border-[var(--border)] rounded text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer" @click="nonce = randomHex(12)">↻ 随机 Nonce</button>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" inputLabel="输入 (明文/Hex密文)" outputLabel="输出" :outputMeta="`长度: ${output.length} · ${elapsed}ms`" @clear="input = ''" />

    <div class="flex items-center justify-center gap-3 mt-5">
      <button class="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer" @click="encrypt">🔒 加密</button>
      <span class="text-[var(--text-3)]">|</span>
      <button class="flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--text)] rounded text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer" @click="decrypt">🔓 解密</button>
    </div>
  </div>
</template>
