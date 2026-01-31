<script setup>
import { ref, reactive, onMounted } from 'vue'
import CopyBtn from '../components/CopyBtn.vue'
import { useHistory } from '../composables/useHistory.js'

const keys = reactive({ publicKey: '', privateKey: '' })
const input = ref('')
const signature = ref('')
const verifyResult = ref('')
const generating = ref(false)
const error = ref('')
const { save: saveHistory, getLast: getLastInput } = useHistory('ed25519')
onMounted(() => { input.value = getLastInput() })


async function generateKeys() {
  generating.value = true; error.value = ''
  try {
    const kp = await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify'])
    const pub = await crypto.subtle.exportKey('raw', kp.publicKey)
    const priv = await crypto.subtle.exportKey('pkcs8', kp.privateKey)
    keys.publicKey = Array.from(new Uint8Array(pub)).map(b => b.toString(16).padStart(2,'0')).join('')
    keys.privateKey = btoa(String.fromCharCode(...new Uint8Array(priv)))
  } catch (e) {
    error.value = `浏览器不支持 Ed25519: ${e.message}`
  }
  generating.value = false
}

async function sign() {
  error.value = ''
  try {
    const privKey = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(keys.privateKey), c => c.charCodeAt(0)).buffer, 'Ed25519', false, ['sign'])
    const sig = await crypto.subtle.sign('Ed25519', privKey, new TextEncoder().encode(input.value))
    signature.value = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('')
  } catch (e) { error.value = e.message }
}

async function verify() {
  error.value = ''
  try {
    const pubBytes = new Uint8Array(keys.publicKey.match(/.{2}/g).map(h => parseInt(h, 16)))
    const pubKey = await crypto.subtle.importKey('raw', pubBytes, 'Ed25519', false, ['verify'])
    const sigBytes = new Uint8Array(signature.value.match(/.{2}/g).map(h => parseInt(h, 16)))
    const ok = await crypto.subtle.verify('Ed25519', pubKey, sigBytes, new TextEncoder().encode(input.value))
    verifyResult.value = ok ? '✅ 签名验证通过' : '❌ 签名验证失败'
  } catch (e) { error.value = e.message }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">✍</span>
        Ed25519
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">Ed25519 数字签名 (Web Crypto API)</p>
    </div>

    <div v-if="error" class="text-red-400 text-[12px] mb-3 mono border border-red-400/20 rounded p-2">{{ error }}</div>

    <button :disabled="generating" class="px-5 py-2 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[12px] hover:brightness-110 transition cursor-pointer disabled:opacity-50 mb-4" @click="generateKeys">
      {{ generating ? '生成中...' : '生成密钥对' }}
    </button>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">公钥 (Hex) <CopyBtn :value="keys.publicKey" /></label>
        <input v-model="keys.publicKey" placeholder="32 bytes hex" class="!text-[11px]" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">私钥 (Base64 PKCS8) <CopyBtn :value="keys.privateKey" /></label>
        <input v-model="keys.privateKey" placeholder="Base64 PKCS8" class="!text-[11px]" />
      </div>
    </div>

    <div class="mb-4">
      <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium mb-1 block">待签名文本</label>
      <textarea v-model="input" placeholder="输入文本..." class="!min-h-[80px]" />
    </div>

    <div class="flex gap-2 mb-4">
      <button class="px-5 py-2 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[12px] hover:brightness-110 transition cursor-pointer" @click="sign">✍️ 签名</button>
      <button class="px-5 py-2 border border-[var(--border)] text-[var(--text)] rounded text-[12px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer" @click="verify">✔ 验签</button>
    </div>

    <div v-if="signature" class="border border-[var(--border)] rounded bg-[var(--bg)] p-3 mb-3">
      <div class="text-[11px] text-[var(--text-3)] mb-1">签名 (Hex, 64 bytes)</div>
      <div class="mono text-[11px] text-[var(--accent)] break-all flex items-start gap-2">
        <span class="flex-1">{{ signature }}</span>
        <CopyBtn :value="signature" />
      </div>
    </div>

    <div v-if="verifyResult" class="mono text-[13px] p-3 border border-[var(--border)] rounded">{{ verifyResult }}</div>
  </div>
</template>
