<template>
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
        <span class="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-blue-500 peer-checked:border-transparent cursor-pointer"></span>
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
        <span class="w-5 h-5 border border-gray-300 rounded-full peer-checked:bg-green-500 peer-checked:border-transparent cursor-pointer"></span>
        <span class="text-gray-700 font-medium">Storage</span>
      </label>
    </div>

    <!-- Show fields when 'Item' is selected -->
    <div v-if="selectedOption === 'item'" class="space-y-6">
      <div>
        <label for="name" class="block text-gray-700">Name:</label>
        <input
          type="text"
          id="name"
          v-model="item.name"
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
    </div>

    <!-- Storage selected -->
    <div v-if="selectedOption === 'storage'" class="space-y-6">
      <div>
        <label for="name" class="block text-gray-700">Storage Name:</label>
        <input
          type="text"
          id="name"
          v-model="storage.name"
          class="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter storage name"
        />
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
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStorageStore } from '@/composables/useStorage';
import { createItem, createStorage, ItemStatus } from '@/types/models';

// Radio button option (either 'item' or 'storage')
const selectedOption = ref<string>('');

// Item fields
const item = ref({
  name: '',
  category: '',
  quantity: 1,
  status: ItemStatus.Available
});

// Storage fields
const storage = ref({
  name: ''
});

const route = useRoute();
const router = useRouter();
const storageStore = useStorageStore();

// Handle the "Add" button click
const handleAdd = () => {
  const parentId = route.query.id as string | null;

  if (!parentId) {
    alert('Parent ID is required.');
    return;
  }

  if (selectedOption.value === 'storage') {
    if (!storage.value.name) {
      alert('Storage name is required.');
      return;
    }

    // Create a new storage
    const newStorage = createStorage({ name: storage.value.name });

    // Add storage to the store
    storageStore.addStorage(newStorage, parentId);

    router.push({ name: 'home' }); // Navigate back to home or another view
  } else if (selectedOption.value === 'item') {
    if (!item.value.name) {
      alert('Item name is required.');
      return;
    }

    // Create a new item
    const newItem = createItem({
      name: item.value.name,
      category: item.value.category,
      quantity: item.value.quantity,
      status: item.value.status
    });

    // Add item to the parent storage
    storageStore.addItem(newItem, parentId);

    router.push({ name: 'home' });
  }
};
</script>

<style scoped>
/* Custom Radio Button Style */
input[type="radio"].peer:checked + span {
  background-color: #4caf50;
  border-color: transparent;
}

input[type="radio"].peer:checked + span + span {
  color: #4caf50;
}
</style>
