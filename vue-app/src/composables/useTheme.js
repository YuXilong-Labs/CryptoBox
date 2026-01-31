// Created by yuxilong on 2026/01/31
import { ref, watchEffect, computed } from 'vue'

const theme = ref(localStorage.getItem('cryptobox-theme') || 'dark')

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('cryptobox-theme', theme.value)
})

const isDark = computed(() => theme.value === 'dark')

function toggle() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

export function useTheme() {
  return { theme, isDark, toggle }
}
