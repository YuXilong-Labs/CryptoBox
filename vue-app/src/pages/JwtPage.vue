<script setup>
import { ref, computed, onMounted } from 'vue'
import CopyBtn from '../components/CopyBtn.vue'
import { useHistory } from '../composables/useHistory.js'

const token = ref('')
const header = ref('')
const payload = ref('')
const signature = ref('')
const error = ref('')
const { save: saveHistory, getLast: getLastInput } = useHistory('jwt')
onMounted(() => { token.value = getLastInput() })


function decode() {
  error.value = ''
  try {
    const parts = token.value.trim().split('.')
    if (parts.length !== 3) throw new Error('JWT 必须有 3 部分 (header.payload.signature)')
    header.value = JSON.stringify(JSON.parse(atob(parts[0].replace(/-/g,'+').replace(/_/g,'/'))), null, 2)
    payload.value = JSON.stringify(JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/'))), null, 2)
    signature.value = parts[2]
  } catch (e) { error.value = e.message; header.value = ''; payload.value = ''; signature.value = '' }
}

function encode() {
  error.value = ''
  try {
    const h = btoa(JSON.stringify(JSON.parse(header.value))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
    const p = btoa(JSON.stringify(JSON.parse(payload.value))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
    token.value = `${h}.${p}.${signature.value || 'unsigned'}`
  } catch (e) { error.value = e.message }
}
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>JWT 编解码</h1>
      <p>JSON Web Token 解码与编码</p>
    </div>

    <div class="mb-4">
      <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium mb-1 block">JWT Token</label>
      <textarea v-model="token" placeholder="粘贴 JWT token..." class="!min-h-[80px] !text-[11px]" />
    </div>

    <div class="flex gap-2 mb-4">
      <button class="px-5 py-2 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[12px] hover:brightness-110 transition cursor-pointer" @click="decode">解码 →</button>
      <button class="px-5 py-2 border border-[var(--border)] text-[var(--text-1)] rounded text-[12px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer" @click="encode">← 编码</button>
    </div>

    <div v-if="error" class="text-red-400 text-[12px] mb-3 mono">{{ error }}</div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">Header <CopyBtn :value="header" /></label>
        <textarea v-model="header" class="!min-h-[120px] !text-[11px] !text-red-400" placeholder="{}" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">Payload <CopyBtn :value="payload" /></label>
        <textarea v-model="payload" class="!min-h-[120px] !text-[11px] !text-purple-400" placeholder="{}" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">Signature <CopyBtn :value="signature" /></label>
        <textarea v-model="signature" class="!min-h-[120px] !text-[11px] !text-cyan-400" placeholder="..." />
      </div>
    </div>
  </div>
</template>
