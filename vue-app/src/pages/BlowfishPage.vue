<script setup>
import { ref } from 'vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'
import CryptoJS from 'crypto-js'

const key = ref('')
const iv = ref('')
const mode = ref('CBC')
const outputFmt = ref('Base64')
const input = ref('')
const output = ref('')
const elapsed = ref(0)

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
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">🐡</span>
        Blowfish
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">Blowfish 对称分组加密 (64-bit block)</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">模式</label>
        <select v-model="mode"><option>CBC</option><option>ECB</option></select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">输出格式</label>
        <select v-model="outputFmt"><option>Base64</option><option>Hex</option></select>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">KEY (Hex)</label>
        <div class="relative flex items-center">
          <input v-model="key" placeholder="4-56 bytes hex" class="!pr-8" />
          <CopyBtn :value="key" class="absolute right-1.5" />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">IV (Hex)</label>
        <div class="relative flex items-center">
          <input v-model="iv" placeholder="8 bytes" :disabled="mode === 'ECB'" class="!pr-8" />
          <CopyBtn :value="iv" class="absolute right-1.5" />
        </div>
      </div>
    </div>

    <div class="flex gap-2 mb-4">
      <button class="px-3 py-1.5 text-[12px] border border-[var(--border)] rounded text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer" @click="key = randomHex(16)">↻ 随机 Key</button>
      <button v-if="mode !== 'ECB'" class="px-3 py-1.5 text-[12px] border border-[var(--border)] rounded text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer" @click="iv = randomHex(8)">↻ 随机 IV</button>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" :outputMeta="`长度: ${output.length} · ${outputFmt} · ${elapsed}ms`" @clear="input = ''" />

    <div class="flex items-center justify-center gap-3 mt-5">
      <button class="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer" @click="run(false)">🔒 加密</button>
      <span class="text-[var(--text-3)]">|</span>
      <button class="flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--text)] rounded text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer" @click="run(true)">🔓 解密</button>
    </div>
  </div>
</template>
