<script setup>
import { useRoute, useRouter } from 'vue-router'

defineProps({ open: Boolean })
defineEmits(['close'])

const route = useRoute()
const router = useRouter()

const nav = [
  { label: '工作台', icon: 'grid', path: '/' },
  { cat: '对称加密' },
  { label: 'AES', icon: 'lock', path: '/aes', badge: '4 modes' },
  { label: 'DES / 3DES', icon: 'lock', path: '/des' },
  { label: 'ChaCha20', icon: 'zap', path: '/chacha20' },
  { label: 'Blowfish', icon: 'shield', path: '/blowfish' },
  { label: 'RC4', icon: 'x', path: '/rc4' },
  { label: 'SM4', icon: 'circle', path: '/sm4', tag: '国密' },
  { cat: '非对称加密' },
  { label: 'RSA', icon: 'key', path: '/rsa' },
  { label: 'ECC / ECDSA', icon: 'eye', path: '/ecc' },
  { label: 'Ed25519', icon: 'arrow', path: '/ed25519' },
  { label: 'SM2', icon: 'heart', path: '/sm2', tag: '国密' },
  { cat: '哈希 & HMAC' },
  { label: 'Hash 通用', icon: 'hash', path: '/hash', badge: '12+' },
  { label: 'HMAC', icon: 'hash', path: '/hmac' },
  { label: '密码哈希', icon: 'key', path: '/passhash', badge: '4' },
  { cat: '编码 & 序列化' },
  { label: 'Base64 / Base32', icon: 'code', path: '/base64' },
  { label: 'Hex / URL', icon: 'type', path: '/hex' },
  { label: 'JWT', icon: 'file', path: '/jwt' },
  { label: 'JSON 工具', icon: 'braces', path: '/json', badge: '8+' },
  { cat: '工具' },
  { label: '密钥生成器', icon: 'wand', path: '/keygen' },
]

function go(path) {
  router.push(path)
}

function isActive(path) {
  return route.path === path
}
</script>

<template>
  <aside
    :class="[
      'fixed top-0 left-0 h-screen w-[220px] border-r border-[var(--border)] bg-[var(--bg-1)] z-50 overflow-y-auto transition-transform duration-200',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Logo -->
    <div class="px-4 pt-4 pb-3 border-b border-[var(--border)] mb-2">
      <h1 class="mono text-[var(--accent)] text-[15px] font-semibold tracking-tight">CryptoBox</h1>
      <p class="text-[11px] text-[var(--text-3)] mt-0.5">v1.0 · 全能加解密工具箱</p>
    </div>

    <!-- Search -->
    <div class="px-3 pb-3">
      <input
        type="text"
        placeholder="搜索算法..."
        class="!text-[12px] !py-1.5 !px-2.5 !bg-[var(--bg)] !font-sans"
      />
    </div>

    <!-- Nav -->
    <nav>
      <template v-for="(item, i) in nav" :key="i">
        <!-- Category -->
        <div v-if="item.cat" class="text-[10px] uppercase tracking-[1.5px] text-[var(--text-3)] font-semibold px-4 pt-3 pb-1">
          {{ item.cat }}
        </div>
        <!-- Item -->
        <div
          v-else
          :class="[
            'flex items-center gap-2.5 px-4 py-[7px] cursor-pointer text-[13px] border-l-2 transition-all duration-150',
            isActive(item.path)
              ? 'text-[var(--accent)] border-l-[var(--accent)] bg-[var(--accent-dim)]'
              : 'text-[var(--text-2)] border-l-transparent hover:text-[var(--text)] hover:bg-[var(--bg-2)]'
          ]"
          @click="go(item.path); $emit('close')"
        >
          <span class="w-4 h-4 opacity-60">
            <svg v-if="item.icon === 'grid'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            <svg v-else-if="item.icon === 'lock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <svg v-else-if="item.icon === 'key'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            <svg v-else-if="item.icon === 'hash'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
            <svg v-else-if="item.icon === 'code'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <svg v-else-if="item.icon === 'braces'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="12" cy="12" r="10"/></svg>
          </span>
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="ml-auto text-[10px] px-1.5 py-px rounded bg-[var(--accent-dim)] text-[var(--accent)] font-semibold mono">{{ item.badge }}</span>
          <span v-if="item.tag" class="ml-auto text-[10px] px-1.5 py-px rounded bg-red-500/10 text-red-400 font-semibold">{{ item.tag }}</span>
        </div>
      </template>
    </nav>
  </aside>
</template>
