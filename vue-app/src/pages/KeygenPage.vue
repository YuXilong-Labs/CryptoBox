<script setup>
import { ref } from 'vue'
import CopyBtn from '../components/CopyBtn.vue'

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

    <!-- 三栏布局：输出 | 配置+操作 | 说明 -->
    <div class="io-layout fade d1">
      <!-- Left: Output -->
      <div class="io-box">
        <div class="io-top">
          <div class="io-title"><div class="io-dot out"></div>生成结果</div>
          <div class="io-btns">
            <CopyBtn :value="output" />
          </div>
        </div>
        <div class="io-area output" style="white-space:pre-wrap;word-break:break-all;">{{ output || '点击生成按钮…' }}</div>
      </div>

      <!-- Center: Config + Actions -->
      <div class="io-center">
        <div class="center-config">
          <div class="cc-group">
            <span class="cc-label">类型</span>
            <select class="cc-select" v-model="selected">
              <option>随机字节</option>
              <option>UUID</option>
              <option>AES 密钥</option>
              <option>安全密码</option>
            </select>
          </div>
          <div v-if="selected === '随机字节'" class="cc-group">
            <span class="cc-label">字节数</span>
            <select class="cc-select" v-model="byteLen">
              <option>16</option><option>24</option><option>32</option><option>48</option><option>64</option>
            </select>
          </div>
          <div v-if="selected === '安全密码'" class="cc-group">
            <span class="cc-label">长度</span>
            <select class="cc-select" v-model="pwdLen">
              <option>8</option><option>12</option><option>16</option><option>24</option><option>32</option>
            </select>
          </div>
        </div>
        <div class="center-actions">
          <button class="ca-btn primary" @click="generate"><span class="btn-text">生成</span></button>
        </div>
      </div>

      <!-- Right: Info -->
      <div class="io-box">
        <div class="io-top">
          <div class="io-title"><div class="io-dot"></div>说明</div>
        </div>
        <div class="p-3.5 text-[12px] text-[var(--text-2)] leading-relaxed" style="font-family:var(--font)">
          <div v-if="selected === '随机字节'">
            <p class="mb-2 font-medium text-[var(--text-1)]">随机字节</p>
            <p>使用 <code class="mono text-[11px] px-1 py-0.5 bg-[var(--bg-2)] rounded">crypto.getRandomValues</code> 生成密码学安全的随机字节序列，输出为 Hex 编码。</p>
          </div>
          <div v-else-if="selected === 'UUID'">
            <p class="mb-2 font-medium text-[var(--text-1)]">UUID v4</p>
            <p>使用 <code class="mono text-[11px] px-1 py-0.5 bg-[var(--bg-2)] rounded">crypto.randomUUID()</code> 生成符合 RFC 4122 的 v4 UUID。</p>
          </div>
          <div v-else-if="selected === 'AES 密钥'">
            <p class="mb-2 font-medium text-[var(--text-1)]">AES 密钥</p>
            <p>一次生成 128/192/256-bit 三种长度的 AES 密钥（Hex 编码），可直接用于 AES 加密。</p>
          </div>
          <div v-else>
            <p class="mb-2 font-medium text-[var(--text-1)]">安全密码</p>
            <p>从大小写字母、数字和符号中随机选取字符生成高强度密码。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
