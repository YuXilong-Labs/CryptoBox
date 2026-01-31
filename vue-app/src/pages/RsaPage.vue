<script setup>
import { ref, reactive, onMounted } from 'vue'
import IOPanel from '../components/IOPanel.vue'
import CopyBtn from '../components/CopyBtn.vue'
import { useHistory } from '../composables/useHistory.js'

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

function swap() { const t = input.value; input.value = output.value; output.value = t }
</script>

<template>
  <div>
    <div class="tool-header fade">
      <h1>RSA 加解密</h1>
      <p>RSA-OAEP 加密/解密，基于 Web Crypto API</p>
    </div>

    <!-- Key pair -->
    <div class="key-bar fade d1">
      <div class="key-group" style="min-width:140px;flex:0">
        <span class="cfg-label">密钥</span>
        <select class="cc-select" v-model="keySize" style="width:100px">
          <option>1024</option><option>2048</option><option>4096</option>
        </select>
        <button class="qbtn" :disabled="generating" @click="generateKeys">{{ generating ? '生成中…' : '🎲 生成' }}</button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4 fade d1">
      <div class="flex flex-col gap-1">
        <label class="cc-label flex items-center gap-2">公钥 <CopyBtn :value="keys.publicKey" /></label>
        <textarea v-model="keys.publicKey" placeholder="RSA 公钥 (PEM)" class="!min-h-[80px] !text-[11px]" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="cc-label flex items-center gap-2">私钥 <CopyBtn :value="keys.privateKey" /></label>
        <textarea v-model="keys.privateKey" placeholder="RSA 私钥 (PEM)" class="!min-h-[80px] !text-[11px]" />
      </div>
    </div>

    <IOPanel v-model:inputValue="input" :outputValue="output" inputLabel="输入 · 明文" outputLabel="输出 · 密文" @clear="input = ''" @swap="swap">
      <template #config>
        <div class="cc-group">
          <span class="cc-label">算法</span>
          <span style="font-size:12px;color:var(--text-2);font-family:var(--mono)">RSA-OAEP</span>
        </div>
        <div class="cc-group">
          <span class="cc-label">哈希</span>
          <span style="font-size:12px;color:var(--text-2);font-family:var(--mono)">SHA-256</span>
        </div>
      </template>
      <template #actions>
        <button class="ca-btn primary" @click="encrypt"><span class="btn-text">加密</span></button>
        <button class="ca-btn" @click="decrypt"><span class="btn-text">解密</span></button>
      </template>
    </IOPanel>
  </div>
</template>
