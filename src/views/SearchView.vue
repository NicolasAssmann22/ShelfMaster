<script setup lang="ts">
import SearchBar from '../components/search/SearchBar.vue';
import ItemTree from '../components/search/ItemTree.vue';
import useHomeLayout from '../composables/useStorage';

const { addExampleData } = useHomeLayout();
</script>

<template>
  <div class="search-view">
    <SearchBar />
    <button @click="addExampleData">Beispieldaten hinzufügen</button>
  </div>
  <ItemTree />
</template>

<style scoped></style>
