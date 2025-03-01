<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { TreeNodeData } from '../../types/tree'
import * as OutlineIcons from '@heroicons/vue/24/outline'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import { useStorageStore } from '../../composables/useStorage'
import AddField from '../../components/fields/AddField.vue'
import EditField from '../../components/fields/EditField.vue'

const storageStore = useStorageStore()

// Props
const props = defineProps({
  node: {
    type: Object as PropType<TreeNodeData>,
    required: true,
  },
  showAddField: {
    type: Boolean,
    default: true,
  },
  showEditField: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits<{
  (e: 'toggle', node: TreeNodeData): void
}>()

// Handle click event
const handleClick = (event: MouseEvent) => {
  event.stopPropagation()
  emit('toggle', props.node)
}

// Get the icon component dynamically
const getIconComponent = (iconName: string) => {
  return OutlineIcons[iconName as keyof typeof OutlineIcons]
}

// Computed for checking if the node is a storage node
const isStorageNode = computed(() => {
  return storageStore.findStorageById(props.node.id) != null
})
</script>

<template>
  <div
    @click="handleClick"
    :class="[
      'flex items-center space-x-2 cursor-pointer p-2 rounded',
      { highlighted: node.highlighted },
    ]"
  >
    <div class="flex items-center space-x-2 flex-grow hover:text-gray-700">
      <span v-if="node.icon" class="text-gray-500">
        <component :is="getIconComponent(node.icon)" class="w-5 h-5 text-gray-500" />
      </span>
      <span class="font-medium">{{ node.label }}</span>
      <span v-if="node.children?.length" class="text-gray-500">
        <ChevronDownIcon v-if="node.expanded" class="w-5 h-5 text-gray-500"></ChevronDownIcon>
        <ChevronRightIcon v-else class="w-5 h-5 text-gray-500"></ChevronRightIcon>
      </span>
    </div>

    <!-- Align AddField to the right -->

    <AddField v-if="showAddField && isStorageNode" :node="node" />
    <EditField v-if="showEditField" :node="node" />
  </div>
</template>

<style scoped></style>
