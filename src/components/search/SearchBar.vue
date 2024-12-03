<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <header class="flex items-center p-4 bg-purple-100 rounded-lg">
    <input type="text" placeholder="Gegenstand suchen..." class="flex-1 px-4 py-2 text-sm border rounded-lg outline-none border-gray-300 focus:ring-2 focus:ring-purple-500" />
    <button class="ml-4 text-purple-500 hover:text-purple-700">
      <MagnifyingGlassIcon class="h-6 w-6 text-blue-500" />
    </button>
  </header>
</template>

<style scoped>

</style>
