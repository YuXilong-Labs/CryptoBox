<script setup>
import { useRoute } from 'vue-router'
defineEmits(['toggle-menu'])
const route = useRoute()
</script>

<template>
  <header class="h-12 border-b border-[var(--border)] bg-[var(--bg-1)] flex items-center justify-between px-5 sticky top-0 z-30">
    <div class="flex items-center gap-2">
      <button
        class="lg:hidden w-8 h-8 flex items-center justify-center text-[var(--text-2)] hover:text-[var(--accent)]"
        @click="$emit('toggle-menu')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <span class="text-[12px] text-[var(--text-3)]">CryptoBox</span>
      <span class="text-[12px] text-[var(--text-3)]">/</span>
      <span class="text-[12px] text-[var(--text)] font-medium">{{ route.meta.title || '工作台' }}</span>
    </div>
  </header>
</template>
