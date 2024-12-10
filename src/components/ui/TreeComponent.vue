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
  node.expanded = !node.expanded; // Toggle the expanded state of the node
  collapseAllChildren(node)
};

const collapseAllChildren = (node: TreeNodeData) => {
  if (node.expanded! && node.children) {
    node.children.forEach((child) => {
      child.expanded = false; // Collapse all child nodes
      collapseAllChildren(child); // Recursively collapse deeper levels
    });
  }
}
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
