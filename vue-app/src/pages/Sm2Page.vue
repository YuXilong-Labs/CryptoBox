<script setup>
import { ref, onMounted } from 'vue'
import CopyBtn from '../components/CopyBtn.vue'
import { useHistory } from '../composables/useHistory.js'

// SM2 uses P-256 curve as approximation via Web Crypto (real SM2 uses a different curve)
const publicKey = ref('')
const privateKey = ref('')
const input = ref('')
const signature = ref('')
const verifyResult = ref('')
const generating = ref(false)
const { save: saveHistory, getLast: getLastInput } = useHistory('sm2')
onMounted(() => { input.value = getLastInput() })


async function generateKeys() {
  generating.value = true
  try {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])
    const pub = await crypto.subtle.exportKey('raw', kp.publicKey)
    const priv = await crypto.subtle.exportKey('jwk', kp.privateKey)
    publicKey.value = Array.from(new Uint8Array(pub)).map(b => b.toString(16).padStart(2,'0')).join('')
    privateKey.value = priv.d
  } catch (e) { signature.value = `错误: ${e.message}` }
  generating.value = false
}

async function sign() {
  try {
    const jwk = { kty: 'EC', crv: 'P-256', d: privateKey.value, x: publicKey.value ? btoa(String.fromCharCode(...new Uint8Array(publicKey.value.match(/.{2}/g).map(h=>parseInt(h,16))).slice(1,33))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_') : '', y: publicKey.value ? btoa(String.fromCharCode(...new Uint8Array(publicKey.value.match(/.{2}/g).map(h=>parseInt(h,16))).slice(33))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_') : '' }
    const privKey = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
    const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SM3' in crypto.subtle ? 'SM3' : 'SHA-256' }, privKey, new TextEncoder().encode(input.value))
    signature.value = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('')
  } catch (e) { signature.value = `错误: ${e.message}` }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-red-500/10 rounded border border-red-500/20 text-red-400">密</span>
        SM2 国密
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">SM2 椭圆曲线签名（基于 ECDSA P-256 近似实现）</p>
    </div>

    <div class="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 mb-4 text-[12px] text-yellow-400">
      ⚠ 注意：浏览器 Web Crypto 不原生支持 SM2 曲线，此页使用 P-256 + SHA-256 近似。完整 SM2 实现需要专用库。
    </div>

    <button :disabled="generating" class="px-5 py-2 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[12px] hover:brightness-110 transition cursor-pointer disabled:opacity-50 mb-4" @click="generateKeys">
      {{ generating ? '生成中...' : '生成密钥对' }}
    </button>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">公钥 (Hex) <CopyBtn :value="publicKey" /></label>
        <textarea v-model="publicKey" placeholder="公钥 hex..." class="!min-h-[60px] !text-[11px]" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">私钥 (Base64url) <CopyBtn :value="privateKey" /></label>
        <input v-model="privateKey" placeholder="私钥..." class="!text-[11px]" />
      </div>
    </div>

    <div class="mb-4">
      <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium mb-1 block">待签名文本</label>
      <textarea v-model="input" placeholder="输入文本..." class="!min-h-[80px]" />
    </div>

    <button class="px-5 py-2 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[12px] hover:brightness-110 transition cursor-pointer mb-4" @click="sign">✍️ 签名</button>

    <div v-if="signature" class="border border-[var(--border)] rounded bg-[var(--bg)] p-3">
      <div class="text-[11px] text-[var(--text-3)] mb-1">签名 (Hex)</div>
      <div class="mono text-[11px] text-[var(--accent)] break-all flex items-start gap-2">
        <span class="flex-1">{{ signature }}</span>
        <CopyBtn :value="signature" />
      </div>
    </div>
  </div>
</template>
