<script setup>
defineProps({
  title: String,
  desc: String,
  icon: { type: String, default: '🔧' },
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">{{ icon }}</span>
        {{ title }}
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">{{ desc }}</p>
    </div>
    <div class="border border-[var(--border)] border-dashed rounded-md p-12 text-center">
      <div class="text-3xl mb-3 opacity-30">🚧</div>
      <p class="text-[var(--text-3)] text-sm">开发中...</p>
    </div>
  </div>
</template>
