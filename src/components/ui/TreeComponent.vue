<script setup lang="ts">
import { defineProps, type PropType } from 'vue'
import type { TreeNodeData } from '../../types/tree.ts';
import TreeNode from './TreeNode.vue';

const props = defineProps({
  nodes: {
    type: Array as PropType<TreeNodeData[]>,
    required: true
  },
});

const toggleNode = (node: TreeNodeData) => {
  console.log('Toggling node', node); // Debugging line
  node.expanded = !node.expanded; // Toggle the expanded state of the node
};
</script>

<template>
    <ul class="list-none p-0 space-y-2">
      <TreeNode
        v-for="node in props.nodes"
        :key="node.id"
        :node="node"
        @toggle="toggleNode"
      />
    </ul>
</template>

<style scoped>

</style>
