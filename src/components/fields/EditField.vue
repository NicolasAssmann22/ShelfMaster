<template>
  <span
    @click.stop="handleEditField(node)"
    class="p-1 rounded cursor-pointer hover:bg-gray-200 hover:text-gray-700"
  >
    <PencilIcon class="w-5 h-5 text-gray-500" />
  </span>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'
import type { TreeNodeData } from '../../types/tree'
import { useRouter } from 'vue-router'
import { PencilIcon } from '@heroicons/vue/24/outline'

// Props: parentNode, der den Knoten enthält, zu dem wir das Feld hinzufügen wollen
defineProps({
  node: {
    type: Object as PropType<TreeNodeData>,
    required: true,
  },
})

defineEmits<{
  (e: 'add-field', parentNode: TreeNodeData): void
}>()
const router = useRouter()

const handleEditField = (node: TreeNodeData) => {
  // Navigiere zur Route mit einem Abfrage-Parameter
  router.push({ name: 'edit', query: { id: node.id } })
}
</script>

<style scoped></style>
