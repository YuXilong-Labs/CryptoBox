<script setup>
import { ref, onMounted } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import CopyBtn from '../components/CopyBtn.vue'
import { useHistory } from '../composables/useHistory.js'

const modes = ['PBKDF2', 'SHA-256 x N']
const selected = ref('PBKDF2')
const password = ref('')
const salt = ref('')
const iterations = ref('100000')
const output = ref('')
const computing = ref(false)
const { save: saveHistory, getLast: getLastInput } = useHistory('passhash')
onMounted(() => { password.value = getLastInput() })


function randomHex(n) { return Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b=>b.toString(16).padStart(2,'0')).join('') }

async function compute() {
  if (!password.value) return
  computing.value = true
  try {
    if (selected.value === 'PBKDF2') {
      const enc = new TextEncoder()
      const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password.value), 'PBKDF2', false, ['deriveBits'])
      const saltBytes = salt.value ? new Uint8Array(salt.value.match(/.{2}/g).map(h=>parseInt(h,16))) : crypto.getRandomValues(new Uint8Array(16))
      if (!salt.value) salt.value = Array.from(saltBytes).map(b=>b.toString(16).padStart(2,'0')).join('')
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: parseInt(iterations.value), hash: 'SHA-256' }, keyMaterial, 256)
      output.value = `Salt: ${salt.value}\nHash: ${Array.from(new Uint8Array(bits)).map(b=>b.toString(16).padStart(2,'0')).join('')}\nIterations: ${iterations.value}`
    } else {
      let hash = new TextEncoder().encode(password.value + (salt.value || ''))
      const n = Math.min(parseInt(iterations.value), 100000)
      for (let i = 0; i < n; i++) {
        hash = new Uint8Array(await crypto.subtle.digest('SHA-256', hash))
      }
      output.value = Array.from(hash).map(b=>b.toString(16).padStart(2,'0')).join('')
    }
  } catch (e) { output.value = `错误: ${e.message}` }
  computing.value = false
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">🔑</span>
        密码哈希
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">PBKDF2 / 迭代 SHA-256 — 密码派生与慢哈希</p>
    </div>

    <PillGroup :items="modes" v-model="selected" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">密码</label>
        <input v-model="password" placeholder="输入密码" type="password" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">Salt (Hex) <button class="text-[var(--accent)] text-[10px]" @click="salt = randomHex(16)">随机</button></label>
        <input v-model="salt" placeholder="留空自动生成" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">迭代次数</label>
        <select v-model="iterations"><option>1000</option><option>10000</option><option>100000</option><option>600000</option></select>
      </div>
    </div>

    <button :disabled="computing" class="px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer disabled:opacity-50 mb-4" @click="compute">
      {{ computing ? '计算中...' : '计算' }}
    </button>

    <div v-if="output" class="border border-[var(--border)] rounded bg-[var(--bg)] p-4">
      <div class="flex items-start justify-between gap-2">
        <pre class="mono text-[12px] text-[var(--accent)] whitespace-pre-wrap break-all flex-1">{{ output }}</pre>
        <CopyBtn :value="output" />
      </div>
    </div>
  </div>
</template>
