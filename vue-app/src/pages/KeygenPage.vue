<script setup>
import { ref } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import CopyBtn from '../components/CopyBtn.vue'

const modes = ['随机字节', 'UUID', 'AES 密钥', '安全密码']
const selected = ref('随机字节')
const byteLen = ref('32')
const pwdLen = ref('24')
const output = ref('')

function randomHex(n) {
  return Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b => b.toString(16).padStart(2,'0')).join('')
}

function generate() {
  switch (selected.value) {
    case '随机字节': output.value = randomHex(parseInt(byteLen.value)); break
    case 'UUID': output.value = crypto.randomUUID(); break
    case 'AES 密钥': output.value = `128-bit: ${randomHex(16)}\n192-bit: ${randomHex(24)}\n256-bit: ${randomHex(32)}`; break
    case '安全密码': {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
      const arr = crypto.getRandomValues(new Uint8Array(parseInt(pwdLen.value)))
      output.value = Array.from(arr).map(b => chars[b % chars.length]).join('')
      break
    }
  }
}
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>密钥生成器</h1>
      <p>随机字节、UUID、AES 密钥、安全密码</p>
    </div>

    <PillGroup :items="modes" v-model="selected" />

    <div class="flex gap-3 mb-4 items-end">
      <div v-if="selected === '随机字节'" class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">字节数</label>
        <select v-model="byteLen" class="!w-[120px]"><option>16</option><option>24</option><option>32</option><option>48</option><option>64</option></select>
      </div>
      <div v-if="selected === '安全密码'" class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">长度</label>
        <select v-model="pwdLen" class="!w-[120px]"><option>8</option><option>12</option><option>16</option><option>24</option><option>32</option></select>
      </div>
      <button class="px-5 py-2 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[12px] hover:brightness-110 transition cursor-pointer" @click="generate">生成</button>
    </div>

    <div v-if="output" class="border border-[var(--border)] rounded bg-[var(--bg-0)] p-4">
      <div class="flex items-start justify-between gap-2">
        <pre class="mono text-[12px] text-[var(--accent)] whitespace-pre-wrap break-all flex-1">{{ output }}</pre>
        <CopyBtn :value="output" />
      </div>
    </div>
  </div>
</template>
