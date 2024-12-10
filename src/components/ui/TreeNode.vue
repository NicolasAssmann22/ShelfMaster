<script setup lang="ts">
import type { TreeNodeData } from '../../types/tree.ts';
import { defineProps, type PropType } from 'vue';

const props = defineProps({
  node: {
    type: Object as PropType<TreeNodeData>,
    required: true
  },
});

const emit = defineEmits<{
  (e: "toggle", node: TreeNodeData): void;
}>();

const handleClick = (event: MouseEvent) => {
  event.stopPropagation();
  emit('toggle', props.node);
}
</script>

<template>
 <li>
   <div
     @click="handleClick"
     class="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded"
   >
     <span v-if="node.children?.length" class="text-gray-500">
       <span v-if="node.expanded">👇</span>
       <span v-else>👉</span>
     </span>
     <span class="font-medium">{{ node.label }}</span>
   </div>
   <ul v-if="node.expanded && node.children" class="pl-4 space-y-1">
     <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @toggle="$emit('toggle', $event)"
      />
   </ul>
  </li>
</template>

<style scoped>
</style>
