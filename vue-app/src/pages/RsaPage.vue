<script setup>
import { ref, reactive, onMounted } from 'vue'
import PillGroup from '../components/PillGroup.vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'
import { useHistory } from '../composables/useHistory.js'

const modes = ['加密/解密', '签名/验签']
const selected = ref('加密/解密')
const keySize = ref('2048')
const keys = reactive({ publicKey: '', privateKey: '' })
const input = ref('')
const output = ref('')
const generating = ref(false)
const { save: saveHistory, getLast: getLastInput } = useHistory('rsa')
onMounted(() => { input.value = getLastInput() })


async function generateKeys() {
  generating.value = true
  try {
    const kp = await crypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: parseInt(keySize.value), publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true, ['encrypt', 'decrypt']
    )
    const pub = await crypto.subtle.exportKey('spki', kp.publicKey)
    const priv = await crypto.subtle.exportKey('pkcs8', kp.privateKey)
    keys.publicKey = `-----BEGIN PUBLIC KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(pub))).match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`
    keys.privateKey = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(priv))).match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`
  } catch (e) { output.value = `错误: ${e.message}` }
  generating.value = false
}

function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
  const bin = atob(b64)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf.buffer
}

async function encrypt() {
  try {
    const pubKey = await crypto.subtle.importKey('spki', pemToArrayBuffer(keys.publicKey), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
    const enc = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, new TextEncoder().encode(input.value))
    output.value = btoa(String.fromCharCode(...new Uint8Array(enc)))
  } catch (e) { output.value = `错误: ${e.message}` }
}

async function decrypt() {
  try {
    const privKey = await crypto.subtle.importKey('pkcs8', pemToArrayBuffer(keys.privateKey), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt'])
    const bin = atob(input.value)
    const buf = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
    const dec = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privKey, buf.buffer)
    output.value = new TextDecoder().decode(dec)
  } catch (e) { output.value = `错误: ${e.message}` }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
        </span>
        RSA 加解密
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">RSA-OAEP 加密/解密，基于 Web Crypto API</p>
    </div>

    <PillGroup :items="modes" v-model="selected" />

    <div class="flex gap-3 mb-4 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">密钥长度</label>
        <select v-model="keySize" class="!w-[140px]"><option>1024</option><option>2048</option><option>4096</option></select>
      </div>
      <button :disabled="generating" class="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[12px] hover:brightness-110 transition cursor-pointer disabled:opacity-50" @click="generateKeys">
        {{ generating ? '生成中...' : '生成密钥对' }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">公钥 <CopyBtn :value="keys.publicKey" /></label>
        <textarea v-model="keys.publicKey" placeholder="RSA 公钥 (PEM)" class="!min-h-[100px] !text-[11px]" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">私钥 <CopyBtn :value="keys.privateKey" /></label>
        <textarea v-model="keys.privateKey" placeholder="RSA 私钥 (PEM)" class="!min-h-[100px] !text-[11px]" />
      </div>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" :inputLabel="selected === '加密/解密' ? '明文' : '待签名'" :outputLabel="selected === '加密/解密' ? '密文' : '签名'" @clear="input = ''" />

    <div class="flex items-center justify-center gap-3 mt-5">
      <button class="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] border border-[var(--accent)] text-black font-semibold rounded text-[13px] hover:brightness-110 transition cursor-pointer" @click="encrypt">🔒 加密</button>
      <span class="text-[var(--text-3)]">|</span>
      <button class="flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--text)] rounded text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer" @click="decrypt">🔓 解密</button>
    </div>
  </div>
</template>
