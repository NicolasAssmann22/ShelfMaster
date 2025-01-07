<template>
  <BackButton />
  <div class="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
    <!-- Radio buttons for item or storage selection -->
    <div class="mb-6 flex items-center space-x-6">
      <label class="flex items-center space-x-2">
        <input
          type="radio"
          v-model="selectedOption"
          value="item"
          id="item-radio"
          class="hidden peer"
        />
        <span
          class="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-blue-500 peer-checked:border-transparent cursor-pointer"
        ></span>
        <span class="text-gray-700 font-medium">Item</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          type="radio"
          v-model="selectedOption"
          value="storage"
          id="storage-radio"
          class="hidden peer"
        />
        <span
          class="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-green-500 peer-checked:border-transparent cursor-pointer"
        ></span>
        <span class="text-gray-700 font-medium">Storage</span>
      </label>
    </div>

    <!-- Display the path -->
    <div v-if="path && path.length" class="mb-6 text-sm text-gray-600">
      <span v-for="(part, index) in path" :key="index">
        <span>{{ part }}</span>
        <span v-if="index < path.length - 1" class="text-gray-400 mx-1">/</span>
      </span>
    </div>

    <!-- Show fields when 'Item' is selected -->
    <div v-if="selectedOption === 'item'" class="space-y-6">
      <div>
        <label for="name" class="block text-gray-700">Name:</label>
        <input
          type="text"
          id="name"
          v-model="item.name"
          ref="itemNameInput"
          :class="{ 'required': !item.name }"
          class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter item name"
        />
      </div>

      <div>
        <label for="category" class="block text-gray-700">Category:</label>
        <select
          id="category"
          v-model="item.category"
          class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
        </select>
      </div>

      <div>
        <label for="quantity" class="block text-gray-700">Quantity:</label>
        <input
          type="number"
          id="quantity"
          v-model.number="item.quantity"
          class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter quantity"
          min="1"
        />
      </div>

      <div>
        <label for="status" class="block text-gray-700">Status:</label>
        <select
          id="status"
          v-model="item.status"
          class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="available">Available</option>
          <option value="lent">Lent</option>
        </select>
      </div>

      <!-- Icon selection grid -->
      <div>
        <label for="icon" class="block text-gray-700">Icon:</label>
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="iconName in iconOptions"
            :key="iconName"
            @click="item.icon = iconName"
            :class="{
              'border-2 border-blue-500': item.icon === iconName,
              'cursor-pointer': true,
            }"
            class="flex justify-center items-center p-2 rounded-md hover:bg-gray-100"
          >
            <component :is="getIconComponent(iconName)" class="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- Storage selected -->
    <div v-if="selectedOption === 'storage'" class="space-y-6">
      <div>
        <label for="name" class="block text-gray-700">Storage Name:</label>
        <input
          type="text"
          id="name"
          v-model="storage.name"
          ref="storageNameInput"
          :class="{ 'required': !storage.name }"
          class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter storage name"
        />
      </div>

      <FieldLabel id="description" ref="descriptionField">
        <template #label>Description:</template>
        <template #input>
          <textarea
            v-model="storage.description"
            id="description"
            class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter description"
          ></textarea>
        </template>
      </FieldLabel>

      <!-- Icon selection grid for storage -->
      <div>
        <label for="icon" class="block text-gray-700">Icon:</label>
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="iconName in iconOptions"
            :key="iconName"
            @click="storage.icon = iconName"
            :class="{
              'border-2 border-green-500': storage.icon === iconName,
              'cursor-pointer': true,
            }"
            class="flex justify-center items-center p-2 rounded-md hover:bg-gray-100"
          >
            <component :is="getIconComponent(iconName)" class="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>
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

<script setup lang="ts">
import * as OutlineIcons from '@heroicons/vue/24/outline'
import { useRoute, useRouter } from 'vue-router'
import { useStorageStore } from '../composables/useStorage'
import { useIconsStore } from '../composables/iconsStore'
import { createItem, createStorage, type Item, type Storage, ItemStatus } from '../types/models'
import { onMounted, computed, ref } from 'vue'
import FieldLabel from '../components/fields/FieldLabel.vue'
import BackButton from '../components/ui/BackButton.vue'

// Radio button option (either 'item' or 'storage')
const selectedOption = ref<string>('item')

const itemNameInput = ref<HTMLInputElement | null>(null)
const storageNameInput = ref<HTMLInputElement | null>(null)

// Item fields
const item = ref<Partial<Item>>({
  name: '',
  category: '',
  quantity: 1,
  status: ItemStatus.Available,
  icon: 'WrenchIcon', // Default icon for item
})

// Storage fields
const storage = ref<Partial<Storage>>({
  name: '',
  description: '',
  icon: 'FolderIcon', // Default icon for storage
})

const path = computed(() => {
  if (!route.query.id) return []
  return storageStore.getStoragePath(route.query.id as string) || []
})

// List of available icons
const iconsStore = useIconsStore()
const iconOptions = iconsStore.iconOptions

// Function to dynamically get the selected icon component
const getIconComponent = (iconName: string) => {
  return OutlineIcons[iconName as keyof typeof OutlineIcons]
}

const route = useRoute()
const router = useRouter()
const storageStore = useStorageStore()

const setFocus = () => {
  if (selectedOption.value === 'item') {
    itemNameInput.value?.focus()
  } else {
    storageNameInput.value?.focus()
  }
}

onMounted(setFocus)

// Handle the "Add" button click
const handleAdd = () => {
  const parentId = route.query.id as string | null

  if (!parentId) {
    alert('Parent ID is required.')
    return
  }

  if (selectedOption.value === 'storage') {
    if (!storage.value.name) {
      alert('Storage name is required.')
      return
    }

    // Create a new storage with the selected icon
    const newStorage = createStorage({
      name: storage.value.name,
      icon: storage.value.icon, // Include selected icon
    })

    // Add storage to the store
    storageStore.addStorage(newStorage, parentId)

    router.push({ name: 'home' }) // Navigate back to home or another view
  } else if (selectedOption.value === 'item') {
    if (!item.value.name) {
      alert('Item name is required.')
      return
    }

    // Create a new item with the selected icon
    const newItem = createItem({
      name: item.value.name,
      category: item.value.category,
      quantity: item.value.quantity,
      status: item.value.status,
      icon: item.value.icon, // Include selected icon
    })

    // Add item to the parent storage
    storageStore.addItem(newItem, parentId)

    router.push({ name: 'home' })
  }
}
</script>

<style scoped>
/* Custom styles for the icon grid */
.cursor-pointer:hover {
  background-color: #f0f0f0;
}

.border-2 {
  border-width: 2px;
}

.required {
  border-color: #ff0000;
}
</style>
