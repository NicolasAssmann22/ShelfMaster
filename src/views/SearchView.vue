<script setup lang="ts">
import SearchBar from '../components/search/SearchBar.vue';
import ItemTree from '../components/search/ItemTree.vue';
import { ref } from 'vue'

const searchText = ref('')

const handleSearch = (text: string) => {
  searchText.value = text
}

</script>

<template>
  <div class="search-view">
    <SearchBar @search="handleSearch"/>
    <ItemTree :searchText="searchText"/>
  </div>
</template>

<style scoped></style>
