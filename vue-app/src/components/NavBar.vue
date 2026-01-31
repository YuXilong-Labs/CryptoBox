<!-- Created by yuxilong on 2026/01/31 -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme.js'

const route = useRoute()
const router = useRouter()
const { isDark, toggle: toggleTheme } = useTheme()

// 导航分类数据
const categories = [
  {
    label: '对称加密',
    items: [
      { name: 'AES', path: '/aes', tag: '4 modes' },
      { name: 'DES / 3DES', path: '/des' },
      { name: 'ChaCha20', path: '/chacha20' },
      { name: 'Blowfish', path: '/blowfish' },
      { name: 'RC4', path: '/rc4' },
      { name: 'SM4', path: '/sm4', tag: '国密' },
    ]
  },
  {
    label: '非对称加密',
    items: [
      { name: 'RSA', path: '/rsa', tag: '加密/签名' },
      { name: 'ECC / ECDSA', path: '/ecc' },
      { name: 'Ed25519', path: '/ed25519' },
      { name: 'SM2', path: '/sm2', tag: '国密' },
    ]
  },
  {
    label: '哈希',
    items: [
      { name: 'Hash 通用', path: '/hash', tag: '12+' },
      { name: 'HMAC', path: '/hmac' },
      { name: '密码哈希', path: '/passhash', tag: 'bcrypt' },
    ]
  },
  {
    label: '编码',
    items: [
      { name: 'Base64 / Base32', path: '/base64' },
      { name: 'Hex / URL', path: '/hex' },
      { name: 'JWT', path: '/jwt' },
    ]
  },
  {
    label: '工具',
    items: [
      { name: 'JSON 工具', path: '/json' },
      { name: '密钥生成器', path: '/keygen' },
    ]
  },
]

// 搜索用扁平列表
const allTools = categories.flatMap(c => c.items.map(i => ({ ...i, cat: c.label })))

// 下拉状态
const openCat = ref(null)
function toggleDrop(label) {
  openCat.value = openCat.value === label ? null : label
}
function closeDrop() { openCat.value = null }

// 判断分类是否高亮（当前路由在该分类下）
function isCatActive(cat) {
  return cat.items.some(i => i.path === route.path)
}

// 搜索
const searchQuery = ref('')
const searchFocused = ref(false)
const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allTools.filter(t =>
    t.name.toLowerCase().includes(q) || t.cat.includes(q)
  )
})
const showResults = computed(() => searchFocused.value && searchQuery.value.trim())

function navTo(path) {
  router.push(path)
  closeDrop()
  searchQuery.value = ''
}

// 点击外部关闭
function onClickOutside(e) {
  if (!e.target.closest('.ntab-wrap')) closeDrop()
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

// ⌘K 快捷键
const searchRef = ref(null)
function onKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchRef.value?.focus()
  }
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-100 h-[var(--nav-h)] bg-[var(--bg-0)] border-b border-[var(--border)] transition-[background,border] duration-150">
    <div class="h-full flex items-center px-6 gap-4">
      <!-- Logo -->
      <router-link to="/aes" class="flex items-center gap-2 no-underline shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="w-[18px] h-[18px] text-[var(--accent)]"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        <span class="mono font-semibold text-sm text-[var(--text-0)]">CryptoBox</span>
      </router-link>

      <div class="w-px h-4 bg-[var(--border)] shrink-0"></div>

      <!-- Nav Tabs (desktop) -->
      <div class="hidden md:flex gap-px shrink-0">
        <div v-for="cat in categories" :key="cat.label" class="ntab-wrap relative">
          <button
            :class="['flex items-center gap-1 px-3 py-[5px] rounded-[5px] border-none text-[13px] cursor-pointer bg-transparent transition-all duration-150 whitespace-nowrap', isCatActive(cat) ? 'text-[var(--text-0)]' : 'text-[var(--text-2)] hover:text-[var(--text-0)] hover:bg-[var(--surface-hover)]']"
            style="font-family: var(--font)"
            @click.stop="toggleDrop(cat.label)"
          >
            {{ cat.label }}
            <svg :class="['w-2 h-2 opacity-40 transition-transform duration-200', openCat === cat.label && 'rotate-180 opacity-70']" viewBox="0 0 10 10"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>
          </button>
          <!-- Dropdown -->
          <Transition name="drop">
            <div v-if="openCat === cat.label" class="absolute top-[calc(100%+10px)] left-0 min-w-[220px] p-1.5 bg-[var(--bg-1)] border border-[var(--border)] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] z-200">
              <div
                v-for="item in cat.items" :key="item.path"
                class="flex items-center gap-2 px-2.5 py-2 rounded-md text-[var(--text-2)] text-[13px] cursor-pointer transition-all duration-100 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                @click="navTo(item.path)"
              >
                {{ item.name }}
                <span v-if="item.tag" class="mono text-[10px] text-[var(--text-3)] ml-auto">{{ item.tag }}</span>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Search -->
      <div class="relative flex-1 max-w-[280px] md:max-w-[280px] max-md:max-w-full">
        <svg class="absolute left-[9px] top-1/2 -translate-y-1/2 text-[var(--text-3)] w-[14px] h-[14px] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          ref="searchRef"
          v-model="searchQuery"
          type="text"
          placeholder="搜索算法…"
          class="!w-full !py-1.5 !pl-[30px] !pr-10 !rounded-md !border-[var(--border)] !bg-[var(--bg-1)] !text-[var(--text-1)] !text-[12.5px] !font-[var(--font)]"
          @focus="searchFocused = true"
          @blur="setTimeout(() => searchFocused = false, 150)"
        />
        <span class="absolute right-2 top-1/2 -translate-y-1/2 mono text-[10px] text-[var(--text-3)] bg-[var(--kbd-bg)] px-[5px] py-px rounded-[3px] border border-[var(--border)] pointer-events-none" :class="{ 'opacity-0': searchFocused }">⌘K</span>

        <!-- Search results -->
        <div v-if="showResults" class="absolute top-[calc(100%+6px)] left-0 right-0 bg-[var(--bg-1)] border border-[var(--border)] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] p-1.5 z-300 max-h-80 overflow-y-auto">
          <div v-if="searchResults.length === 0" class="py-3 text-center text-xs text-[var(--text-3)]">无匹配结果</div>
          <div
            v-for="item in searchResults" :key="item.path"
            class="flex items-center gap-2 px-2.5 py-2 rounded-md text-[var(--text-2)] text-[13px] cursor-pointer transition-all duration-100 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
            @mousedown.prevent="navTo(item.path)"
          >
            {{ item.name }}
            <span class="text-[10px] text-[var(--text-3)] ml-auto mono">{{ item.cat }}</span>
          </div>
        </div>
      </div>

      <!-- Right: theme toggle -->
      <div class="flex items-center gap-1 shrink-0 ml-auto">
        <button
          class="w-8 h-8 rounded-md border border-transparent bg-transparent cursor-pointer text-[var(--text-2)] flex items-center justify-center text-sm transition-all duration-150 hover:text-[var(--text-0)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
          @click="toggleTheme"
          title="切换主题"
        >
          {{ isDark ? '🌙' : '☀️' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<style>
.drop-enter-active { transition: all 0.15s ease; }
.drop-leave-active { transition: all 0.1s ease; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
