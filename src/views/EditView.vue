<template>
  <BackButton />
  <div class="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
    <h1 class="text-2xl font-bold mb-6">
      Edit {{ isItem ? 'Item' : isStorage ? 'Storage' : 'Category' }}
    </h1>
    <div v-if="node">
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
              v-model="node.name"
              id="name"
              :class="{ required: !node.name }"
              class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </template>
        </FieldLabel>

        <div v-if="isItem">
          <FieldLabel id="category" ref="categoryField">
            <template #label>Category:</template>
            <template #input>
              <select
                v-model="node.categoryId"
                id="category"
                class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select a category</option>
                <option v-for="cat in allCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </template>
          </FieldLabel>

          <FieldLabel id="quantity" ref="quantityField">
            <template #label>Quantity:</template>
            <template #input>
              <input
                type="number"
                v-model.number="(node as Item).quantity"
                id="quantity"
                min="1"
                class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
              />
            </template>
          </FieldLabel>

          <FieldLabel id="status" ref="statusField">
            <template #label>Status:</template>
            <template #input>
              <select
                v-model="(node as Item).status"
                id="status"
                class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </template>
          </FieldLabel>
        </div>

        <div v-if="isStorage">
          <FieldLabel id="description" ref="descriptionField">
            <template #label>Description:</template>
            <template #input>
              <textarea
                v-model="(node as Storage).description"
                id="description"
                class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
              ></textarea>
            </template>
          </FieldLabel>
        </div>

        <div>
          <label for="icon" class="block text-gray-700">Icon:</label>
          <div class="grid grid-cols-4 gap-4">
            <div
              v-for="iconName in iconOptions"
              :key="iconName"
              @click="node.icon = iconName"
              :class="{
                'border-2 border-blue-500': node.icon === iconName,
                'cursor-pointer': true,
              }"
              class="flex justify-center items-center p-2 rounded-md hover:bg-gray-100"
            >
              <component :is="getIconComponent(iconName)" class="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>
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

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Storage, Item, Node, Category } from '../types/models'
import { useStorageStore } from '../composables/useStorage'
import { useIconsStore } from '../composables/iconsStore'
import * as OutlineIcons from '@heroicons/vue/24/outline'
import FieldLabel from '../components/fields/FieldLabel.vue'
import BackButton from '../components/ui/BackButton.vue'
import { useCategoryStore } from '../composables/categoryStorage'

const route = useRoute()
const router = useRouter()
const store = useStorageStore()
const categoryStore = useCategoryStore()

const iconsStore = useIconsStore()
const iconOptions = iconsStore.iconOptions
const allCategories = computed(() => categoryStore.categories)

const nodeId = route.query.id
const node = ref<Node | null>(null)
const selectedCategory = route.query.category
const category = ref<Category | null>(null)

const isItem = computed(() => node.value && 'quantity' in node.value)
const isStorage = computed(() => node.value && 'children' in node.value)
const isCategory = computed(() => category.value !== null)

let previousName: string | undefined = undefined

onMounted(() => {
  if (nodeId) {
    node.value = store.findNodeById(nodeId as string) as Node | null
    if (!node.value) {
      alert('Node not found')
      router.push('/')
    }
    previousName = node.value?.name
  }

  if (selectedCategory) {
    category.value = JSON.parse(selectedCategory as string) as Category | null
    if (!category.value) {
      alert('Category not found')
      router.push('/')
    }
    previousName = category.value?.name
  }

  console.log(node.value.categoryId)
  if (!node.value?.categoryId) {
    node.value.categoryId = '1'
  }

  categoryStore.loadCategoriesData()
})

const handleFormSubmit = () => {
  if (node.value) {
    store.updateNode(node.value as Storage)
    router.push('/')
  }
}

const handleDelete = () => {
  if (node.value) {
    store.deleteNode(node.value.id)
    router.push('/') // Navigate back to the main page after deletion
  } else {
    alert('Node not found')
  }
}

const isNameModified = computed(() => {
  if (isCategory.value && category.value) {
    return category.value?.name !== previousName
  }
  return node.value?.name !== previousName
})

const getIconComponent = (iconName: string) => {
  return OutlineIcons[iconName as keyof typeof OutlineIcons]
}
</script>
