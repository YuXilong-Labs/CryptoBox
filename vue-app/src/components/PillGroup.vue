<script setup>
const props = defineProps({
  items: Array,
  modelValue: String,
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-wrap gap-1.5 mb-4">
    <button
      v-for="item in items"
      :key="item"
      :class="[
        'px-3 py-1 text-[12px] mono rounded border transition-all duration-150 cursor-pointer',
        modelValue === item
          ? 'bg-[var(--accent)] border-[var(--accent)] text-black font-semibold'
          : 'bg-transparent border-[var(--border)] text-[var(--text-2)] hover:border-[var(--text-3)] hover:text-[var(--text-1)]'
      ]"
      @click="emit('update:modelValue', item)"
    >
      {{ item }}
    </button>
  </div>
</template>
