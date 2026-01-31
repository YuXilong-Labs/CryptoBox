<script setup>
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import { ref } from 'vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main -->
    <div class="flex-1 ml-0 lg:ml-[220px] min-h-screen flex flex-col">
      <Topbar @toggle-menu="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 p-6 max-w-[1100px]">
        <router-view />
      </main>
    </div>

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/60 z-40 lg:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>
