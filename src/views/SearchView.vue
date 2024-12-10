<script setup lang="ts">
import SearchBar from '../components/search/SearchBar.vue';
import ItemTree from '../components/search/ItemTree.vue';
import useStorage from '../composables/useStorage';
</script>

<template>
  <div class="search-view">
    <SearchBar />
    <button @click="addExampleData" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Beispiel-Daten hinzufügen
    </button>
  </div>
  <ItemTree />
</template>

<style scoped></style>
