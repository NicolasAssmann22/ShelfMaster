<template>
  <div class="space-y-2">
    <label :for="id" class="block text-gray-700">
      <slot name="label"></slot>
    </label>
    <slot name="input"></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})
</script>

<style scoped></style>
