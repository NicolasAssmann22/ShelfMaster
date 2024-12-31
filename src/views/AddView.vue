<template>
  <div class="p-4">
    <!-- Radio buttons for item or storage selection -->
    <div class="mb-4">
      <label>
        <input type="radio" v-model="selectedOption" value="item" />
        Item
      </label>
      <label class="ml-4">
        <input type="radio" v-model="selectedOption" value="storage" />
        Storage
      </label>
    </div>

    <!-- Show fields when 'Item' is selected -->
    <div v-if="selectedOption === 'item'">
      <div class="mb-4">
        <label for="name" class="block">Name:</label>
        <input
          type="text"
          id="name"
          v-model="item.name"
          class="border p-2 rounded w-full"
          placeholder="Enter item name"
        />
      </div>

      <div class="mb-4">
        <label for="category" class="block">Category:</label>
        <select
          id="category"
          v-model="item.category"
          class="border p-2 rounded w-full"
        >
          <option value="">Select a category</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
        </select>
      </div>

      <div class="mb-4">
        <label for="quantity" class="block">Quantity:</label>
        <input
          type="number"
          id="quantity"
          v-model.number="item.quantity"
          class="border p-2 rounded w-full"
          placeholder="Enter quantity"
          min="1"
        />
      </div>

      <div class="mb-4">
        <label for="status" class="block">Status:</label>
        <select
          id="status"
          v-model="item.status"
          class="border p-2 rounded w-full"
        >
          <option value="available">Available</option>
          <option value="lent">Lent</option>
        </select>
      </div>
    </div>

    <!-- Storage selected -->
    <div v-if="selectedOption === 'storage'">
      <div class="mb-4">
        <label for="name" class="block">Storage Name:</label>
        <input
          type="text"
          id="name"
          v-model="storage.name"
          class="border p-2 rounded w-full"
          placeholder="Enter storage name"
        />
      </div>
    </div>

    <!-- Submit button -->
    <button @click="handleAdd" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
      Add
    </button>
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
/* Custom styles for the form */
.mb-4 {
  margin-bottom: 1rem;
}
</style>
