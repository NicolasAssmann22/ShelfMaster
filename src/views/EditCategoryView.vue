<script setup lang="ts">
import BackButton from '../components/ui/BackButton.vue'
import FieldLabel from '../components/fields/FieldLabel.vue'
import { useCategoryStore } from '../composables/categoryStorage'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Category } from '../types/models'

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()

const categoryId = route.query.id
const category = ref<Category | null>(null)

let previousName: string | undefined = undefined

onMounted(() => {
  if (categoryId) {
    category.value = categoryStore.findCategoryById(categoryId as string) as Category | null
    if (!category.value) {
      alert('Category not found')
      router.push('/')
    }
    previousName = category.value?.name
  }

  categoryStore.loadCategoriesData()
})

const handleFormSubmit = () => {
  if (category.value) {
    categoryStore.updateCategory(category.value)
    router.push('/')
  }else{
    alert('Category not found')
  }
}

const handleDelete = () => {
  if (category.value) {
    categoryStore.removeCategory(categoryId as string)
    router.push('/')
  } else {
    alert('Category not found')
  }
}

const isNameModified = computed(() => {
  return category.value?.name !== previousName
})
</script>

<template>
  <BackButton />
  <div class="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
    <h1 class="text-2xl font-bold mb-6">Edit Category</h1>
    <div v-if="category">
      <form @submit.prevent="handleFormSubmit" class="space-y-6">
        <FieldLabel id="name" ref="nameField">
          <template #label>
            <span :class="{ 'text-blue-500': isNameModified, 'text-gray-700': !isNameModified }">
                Name:
              </span>
          </template>
          <template #input>
            <input
              type="text"
              v-model="category.name"
              id="name"
              :class="{ required: !category.name }"
              class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
            />
          </template>
        </FieldLabel>

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
      </form>
    </div>

    <div class="flex items-center gap-4 mt-4">
      <button
        type="button"
        @click="handleDelete"
        class="w-full bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
      >
        Delete
      </button>

      <button
        type="submit"
        @click="handleFormSubmit"
        class="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Save
      </button>
    </div>
  </div>
</template>

<style scoped></style>
