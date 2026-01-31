<script setup>
import { ref, computed, onMounted } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'
import CryptoJS from 'crypto-js'
import { useHistory } from '../composables/useHistory.js'

const modes = ['DES-CBC', 'DES-ECB', '3DES-CBC', '3DES-ECB']
const { save: saveHistory, getLast: getLastInput } = useHistory('des')
const selectedMode = ref('DES-CBC')

const algo = computed(() => selectedMode.value.startsWith('3') ? 'TripleDES' : 'DES')
const modeStr = computed(() => selectedMode.value.split('-').pop())

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

const meta = computed(() => `长度: ${output.value.length} · 编码: ${outputFmt.value} · 耗时: ${elapsed.value}ms`)
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        DES / 3DES 加解密
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">Data Encryption Standard — DES (64-bit) 和 Triple DES (192-bit)</p>
    </div>

    <PillGroup :items="modes" v-model="selectedMode" />

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">填充</label>
        <select v-model="padding"><option value="Pkcs7">PKCS7</option><option value="ZeroPadding">Zero</option><option value="NoPadding">None</option></select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">输出格式</label>
        <select v-model="outputFmt"><option>Base64</option><option>Hex</option></select>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">KEY</label>
        <div class="relative flex items-center">
          <input v-model="key" :placeholder="algo === 'TripleDES' ? '24 bytes hex' : '8 bytes hex'" class="!pr-8" />
          <CopyBtn :value="key" class="absolute right-1.5" />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">IV</label>
        <div class="relative flex items-center">
          <input v-model="iv" placeholder="8 bytes" :disabled="!needsIV" class="!pr-8" />
          <CopyBtn :value="iv" class="absolute right-1.5" />
        </div>
      </div>
    </div>

    <div class="flex gap-2 mb-4">
      <button class="flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-[var(--border)] rounded text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer" @click="randomKey">↻ 随机 Key</button>
      <button v-if="needsIV" class="flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-[var(--border)] rounded text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer" @click="randomIV">↻ 随机 IV</button>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" :outputMeta="meta" @clear="input = ''" />

    <div class="flex items-center justify-center gap-3 mt-5">
      <button class="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer" @click="run(false)">🔒 加密</button>
      <span class="text-[var(--text-3)]">|</span>
      <button class="flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--text)] rounded text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer" @click="run(true)">🔓 解密</button>
    </div>
  </div>
</template>
