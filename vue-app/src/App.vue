<script setup>
import NavBar from './components/NavBar.vue'
import { useTheme } from './composables/useTheme.js'

// 初始化主题
useTheme()
</script>

<template>
  <div class="min-h-screen">
    <NavBar />
    <main class="pt-[calc(var(--nav-h)+24px)] px-8 pb-10">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>
