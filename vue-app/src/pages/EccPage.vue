<script setup>
import { ref, reactive } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import CopyBtn from '../components/CopyBtn.vue'

const curves = ['P-256', 'P-384', 'P-521']
const selectedCurve = ref('P-256')
const keys = reactive({ publicKey: '', privateKey: '' })
const input = ref('')
const signature = ref('')
const verifyResult = ref('')
const generating = ref(false)

async function generateKeys() {
  generating.value = true
  try {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: selectedCurve.value }, true, ['sign', 'verify'])
    const pub = await crypto.subtle.exportKey('spki', kp.publicKey)
    const priv = await crypto.subtle.exportKey('pkcs8', kp.privateKey)
    keys.publicKey = `-----BEGIN PUBLIC KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(pub))).match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`
    keys.privateKey = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(priv))).match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`
  } catch (e) { signature.value = `错误: ${e.message}` }
  generating.value = false
}

function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
  const bin = atob(b64); const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf.buffer
}

async function sign() {
  try {
    const privKey = await crypto.subtle.importKey('pkcs8', pemToArrayBuffer(keys.privateKey), { name: 'ECDSA', namedCurve: selectedCurve.value }, false, ['sign'])
    const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, new TextEncoder().encode(input.value))
    signature.value = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('')
  } catch (e) { signature.value = `错误: ${e.message}` }
}

async function verify() {
  try {
    const pubKey = await crypto.subtle.importKey('spki', pemToArrayBuffer(keys.publicKey), { name: 'ECDSA', namedCurve: selectedCurve.value }, false, ['verify'])
    const sigBytes = new Uint8Array(signature.value.match(/.{2}/g).map(h => parseInt(h, 16)))
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pubKey, sigBytes, new TextEncoder().encode(input.value))
    verifyResult.value = ok ? '✅ 签名验证通过' : '❌ 签名验证失败'
  } catch (e) { verifyResult.value = `错误: ${e.message}` }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">◎</span>
        ECC / ECDSA
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">椭圆曲线数字签名 (Web Crypto API)</p>
    </div>

    <PillGroup :items="curves" v-model="selectedCurve" />

    <div class="flex gap-3 mb-4 items-end">
      <button :disabled="generating" class="px-5 py-2 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[12px] hover:brightness-110 transition cursor-pointer disabled:opacity-50" @click="generateKeys">
        {{ generating ? '生成中...' : '生成密钥对' }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">公钥 <CopyBtn :value="keys.publicKey" /></label>
        <textarea v-model="keys.publicKey" placeholder="ECDSA 公钥 (PEM)" class="!min-h-[80px] !text-[11px]" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">私钥 <CopyBtn :value="keys.privateKey" /></label>
        <textarea v-model="keys.privateKey" placeholder="ECDSA 私钥 (PEM)" class="!min-h-[80px] !text-[11px]" />
      </div>
    </div>

    <div class="mb-4">
      <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium mb-1 block">待签名文本</label>
      <textarea v-model="input" placeholder="输入要签名的文本..." class="!min-h-[80px]" />
    </div>

    <div class="flex gap-2 mb-4">
      <button class="px-5 py-2 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[12px] hover:brightness-110 transition cursor-pointer" @click="sign">✍️ 签名</button>
      <button class="px-5 py-2 border border-[var(--border)] text-[var(--text)] rounded text-[12px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer" @click="verify">✔ 验签</button>
    </div>

    <div v-if="signature" class="border border-[var(--border)] rounded bg-[var(--bg)] p-3 mb-3">
      <div class="flex items-start justify-between gap-2">
        <div>
          <div class="text-[11px] text-[var(--text-3)] mb-1">签名 (Hex)</div>
          <div class="mono text-[11px] text-[var(--accent)] break-all">{{ signature }}</div>
        </div>
        <CopyBtn :value="signature" />
      </div>
    </div>

    <div v-if="verifyResult" class="mono text-[13px] p-3 border border-[var(--border)] rounded">{{ verifyResult }}</div>
  </div>
</template>
