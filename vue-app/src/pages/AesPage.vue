<script setup>
import { ref, computed, watch } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'
import CryptoJS from 'crypto-js'

// Mode pills
const modes = ['AES-128-CBC', 'AES-256-CBC', 'AES-128-ECB', 'AES-256-ECB', 'AES-128-CTR', 'AES-256-CTR', 'AES-128-GCM', 'AES-256-GCM']
const selectedMode = ref('AES-128-CBC')

// Config
const keySize = ref('128')
const mode = ref('CBC')
const padding = ref('Pkcs7')
const outputFmt = ref('Base64')
const key = ref('')
const iv = ref('')
const input = ref('')
const output = ref('')
const elapsed = ref(0)

// Sync pill → config
watch(selectedMode, (v) => {
  const m = v.match(/AES-(\d+)-(\w+)/)
  if (m) { keySize.value = m[1]; mode.value = m[2] }
})

// Sync config → pill
watch([keySize, mode], () => {
  selectedMode.value = `AES-${keySize.value}-${mode.value}`
})

const needsIV = computed(() => mode.value !== 'ECB')

function randomHex(bytes) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map(b => b.toString(16).padStart(2, '0')).join('')
}

function randomKey() {
  key.value = randomHex(parseInt(keySize.value) / 8)
}

function randomIV() {
  iv.value = randomHex(16)
}

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

const outputMeta = computed(() => {
  const len = output.value ? output.value.length : 0
  return `长度: ${len} · 编码: ${outputFmt.value} · 耗时: ${elapsed.value}ms`
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        AES 加解密
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">Advanced Encryption Standard — 支持 ECB / CBC / CTR / GCM 四种模式</p>
    </div>

    <!-- Mode Pills -->
    <PillGroup :items="modes" v-model="selectedMode" />

    <!-- Config -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">密钥长度</label>
        <select v-model="keySize">
          <option value="128">128 bit</option>
          <option value="192">192 bit</option>
          <option value="256">256 bit</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">模式</label>
        <select v-model="mode">
          <option>CBC</option>
          <option>ECB</option>
          <option>CTR</option>
          <option>CFB</option>
          <option>OFB</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">填充</label>
        <select v-model="padding">
          <option value="Pkcs7">PKCS7</option>
          <option value="ZeroPadding">Zero</option>
          <option value="NoPadding">None</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">输出格式</label>
        <select v-model="outputFmt">
          <option>Base64</option>
          <option>Hex</option>
        </select>
      </div>
    </div>

    <!-- Key / IV -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">KEY</label>
        <div class="relative flex items-center">
          <input v-model="key" :placeholder="`输入密钥或点击生成 (${keySize.value || keySize} bit)`" class="!pr-8" />
          <CopyBtn :value="key" class="absolute right-1.5" />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">IV</label>
        <div class="relative flex items-center">
          <input v-model="iv" placeholder="16 bytes" :disabled="!needsIV" class="!pr-8" />
          <CopyBtn :value="iv" class="absolute right-1.5" />
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="flex gap-2 mb-4">
      <button class="flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-[var(--border)] rounded text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer" @click="randomKey">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-3 h-3"><path d="M21 12a9 9 0 11-6.2-8.5"/><path d="M21 3v6h-6"/></svg>
        随机 Key
      </button>
      <button v-if="needsIV" class="flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-[var(--border)] rounded text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer" @click="randomIV">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-3 h-3"><path d="M21 12a9 9 0 11-6.2-8.5"/><path d="M21 3v6h-6"/></svg>
        随机 IV
      </button>
    </div>

    <!-- IO -->
    <IOPanel
      v-model:inputValue="input"
      :outputValue="output"
      :outputMeta="outputMeta"
      @clear="input = ''"
    />

    <!-- Actions -->
    <div class="flex items-center justify-center gap-3 mt-5">
      <button
        class="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer"
        @click="encrypt"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        加密 Encrypt
      </button>
      <span class="text-[var(--text-3)]">|</span>
      <button
        class="flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--text)] rounded text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer"
        @click="decrypt"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5"/></svg>
        解密 Decrypt
      </button>
    </div>
  </div>
</template>
