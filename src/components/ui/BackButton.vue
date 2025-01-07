<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};

</script>

<template>
  <button
    @click="goBack"
    class="fixed top-4 left-4 w-12 h-12 bg-gray-200 text-gray-700 rounded-full shadow-md flex justify-center items-center hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400"
  >
    <ChevronLeftIcon class="w-6 h-6" />
  </button>
</template>

<style scoped>

</style>
