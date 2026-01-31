<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const categories = [
  {
    icon: '🔒', title: '对称加密',
    desc: 'AES、DES、3DES、ChaCha20、Blowfish、RC4、SM4',
    tags: ['AES-256-GCM', 'AES-CBC', 'ChaCha20', 'SM4'],
    path: '/aes',
  },
  {
    icon: '🔑', title: '非对称加密',
    desc: 'RSA 加解密/签名、ECC/ECDSA、Ed25519、SM2 国密',
    tags: ['RSA-2048', 'P-256', 'Ed25519', 'SM2'],
    path: '/rsa',
  },
  {
    icon: '#', title: '哈希 & HMAC',
    desc: 'MD5、SHA 全系列、SHA-3、SM3、BLAKE2/3、RIPEMD-160',
    tags: ['SHA-256', 'SHA-3', 'SM3', 'BLAKE3'],
    path: '/hash',
  },
  {
    icon: '</>', title: '编码 & 序列化',
    desc: 'Base64、Base32、Hex、URL Encode、Unicode 编解码',
    tags: ['Base64', 'Hex', 'URL', 'Unicode'],
    path: '/base64',
  },
  {
    icon: '{ }', title: 'JSON 工具',
    desc: 'JSON 格式化、压缩、校验、转换、树形视图',
    tags: ['格式化', '压缩', '转代码', 'Diff'],
    path: '/json',
  },
  {
    icon: '🗝', title: '密钥生成器',
    desc: '一键生成 RSA/ECC/AES 密钥、随机字节、安全密码',
    tags: ['RSA-4096', 'AES-Key', 'Random', 'Password'],
    path: '/keygen',
  },
  {
    icon: '📄', title: 'JWT & 证书',
    desc: 'JWT 编解码与验签、X.509 证书解析、PEM/DER 转换',
    tags: ['JWT', 'X.509', 'PEM', 'DER'],
    path: '/jwt',
  },
]

const stats = [
  { num: '30+', label: '加密算法' },
  { num: '15', label: '功能页面' },
  { num: '27', label: '单元测试' },
  { num: '100%', label: '本地运算' },
]
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold">CryptoBox 工作台</h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1">选择一个加密类别开始工作，支持 30+ 种主流和非主流加解密算法</p>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div
        v-for="cat in categories"
        :key="cat.title"
        class="border border-[var(--border)] rounded-md p-5 cursor-pointer hover:border-[var(--accent)] transition-colors bg-[var(--bg-1)]"
        @click="router.push(cat.path)"
      >
        <div class="w-9 h-9 bg-[var(--accent-dim)] rounded flex items-center justify-center text-base mb-3 text-[var(--accent)]">
          {{ cat.icon }}
        </div>
        <h3 class="mono text-sm font-semibold mb-1.5">{{ cat.title }}</h3>
        <p class="text-[12px] text-[var(--text-3)] leading-relaxed mb-2.5">{{ cat.desc }}</p>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in cat.tags"
            :key="tag"
            class="mono text-[10px] px-2 py-0.5 border border-[var(--border)] rounded bg-[var(--bg-2)] text-[var(--text-2)]"
          >{{ tag }}</span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
      <div
        v-for="s in stats"
        :key="s.label"
        class="text-center py-4 border border-[var(--border)] rounded-md bg-[var(--bg-1)]"
      >
        <div class="mono text-2xl font-bold text-[var(--accent)]">{{ s.num }}</div>
        <div class="text-[11px] text-[var(--text-3)] mt-1">{{ s.label }}</div>
      </div>
    </div>
  </div>
</template>
