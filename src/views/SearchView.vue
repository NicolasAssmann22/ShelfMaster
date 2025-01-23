<script setup lang="ts">
import SearchBar from '../components/search/SearchBar.vue'
import ItemTree from '../components/search/ItemTree.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { useCategoryStore } from '../composables/categoryStorage'

const categoryStore = useCategoryStore()

onMounted(() => {
  categoryStore.loadCategoriesData()
  console.log('Categories updated:', categoryStore.categories)
})

const categories = computed(() => categoryStore.categories)

watch(
  () => categoryStore.categories,
  (newCategories) => {
    if (newCategories.length) {
      console.log('Categories loaded:', newCategories)
    }
  },
)

const searchText = ref('')
const selectedCategory = ref('')
const router = useRouter()

const handleSearch = (text: string) => {
  searchText.value = text
}

const navigateToAddCategory = () => {
  router.push({ name: 'add-category' })
}

const navigateToEditCategory = () => {
  if (selectedCategory.value) {
    router.push({ name: 'edit-category', query: { id: selectedCategory.value} })
  }
}
</script>

<template>
  <div class="search-view">
    <SearchBar @search="handleSearch" />
    <div class="category-dropdown flex items-center gap-2">
      <select v-model="selectedCategory" class="category-dropdown-select">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
        /
      </select>

      <span
        @click="navigateToAddCategory"
        class="p-1 rounded cursor-pointer hover:bg-gray-200 hover:text-gray-700"
      >
        <PlusIcon class="w-5 h-5 text-gray-500" />
      </span>

      <span
        v-if="selectedCategory"
        @click="navigateToEditCategory"
        class="p-1 rounded cursor-pointer hover:bg-gray-200 hover:text-gray-700"
      >
        <PencilIcon class="w-5 h-5 text-gray-500" />
      </span>
    </div>
    <ItemTree :searchText="searchText" :selectedCategory="selectedCategory" />
  </div>
</template>

<style scoped>
.category-dropdown {
  margin-top: 20px;
  margin-bottom: 20px;
  max-width: 100%;
}

.category-dropdown-select {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
  background-color: white;
  border: 1px solid #7c3aed;
  border-radius: 0.375rem;
  outline: none;
  transition: border-color 0.2s ease;
  color: #4a4a4a;
}

.category-dropdown-select:focus {
  border-color: #6b46c1; /* Fokusfarbe */
}
</style>
