<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCategoryStore } from '../composables/categoryStorage'
import { type Category } from '../types/models'
import { ref } from 'vue'
import FieldLabel from '../components/fields/FieldLabel.vue'
import BackButton from '../components/ui/BackButton.vue'

// Category fields
const category = ref<Partial<Category>>({
  name: '',
  description: '',
})

const categoryStore = useCategoryStore()

const router = useRouter()

// Handle the "Add" button click
const handleAdd = () => {
  if(!category.value.name || category.value.name.trim() == ''){
    alert('Category name is required.')
    return
  }

  categoryStore.addCategory({
    name: category.value.name,
    description: category.value.description?.trim() || ''
  })

  router.push({ name: 'home' })
}


</script>

<template>
  <BackButton />
  <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-2xl font-bold mb-6">Add Category</h1>
    <div class="space-y-6">
      <div>
        <label for="name" class="block text-gray-700">Name:</label>
        <input
          type="text"
          id="name"
          v-model="category.name"
          ref="categoryNameInput"
          :class="{ required: !category.name }"
          class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter category name"
        />
      </div>

      <FieldLabel id="description" ref="descriptionField">
        <template #label>Description:</template>
        <template #input>
          <textarea
            v-model="category.description"
            id="description"
            class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter description"
          ></textarea>
        </template>
      </FieldLabel>
    </div>

    <!-- Submit button -->
    <div class="mt-6">
      <button
        @click="handleAdd"
        class="bg-blue-500 text-white py-3 px-6 rounded-lg w-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Add
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>
