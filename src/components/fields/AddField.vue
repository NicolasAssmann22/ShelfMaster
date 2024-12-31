<template>
  <span
    @click.stop="handleAddField(node)"
    class="p-1 rounded cursor-pointer hover:bg-gray-200 hover:text-gray-700"
  >
    <PlusIcon class="w-5 h-5 text-gray-500" />
  </span>
</template>


<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import type { TreeNodeData } from '@/types/tree'
import { useRouter } from 'vue-router';
import {PlusIcon} from "@heroicons/vue/24/outline";

// Props: parentNode, der den Knoten enthält, zu dem wir das Feld hinzufügen wollen
defineProps({
  node: {
    type: Object as PropType<TreeNodeData>,
    required: true
  }
});

defineEmits<{
  (e: 'add-field', parentNode: TreeNodeData): void;
}>();
const router = useRouter();

const handleAddField = (node: TreeNodeData) => {
  // Navigiere zur Route mit einem Abfrage-Parameter
  router.push({ name: 'add', query: { id: node.id } });
};

</script>

<style scoped>
</style>
