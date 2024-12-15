<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Tree from '../ui/TreeComponent.vue';
import type { Node, Storage, Item } from '../../types/models';
import { mapStoragesToTreeNodes } from '../../utils/treeMapper';
import useStorage from '../../composables/useStorage';
import { type SearchResult, searchNodesByName } from '../../utils/search';
import type { TreeNodeData } from '../../types/tree'

/**
 * This component handles domain-specific logic such as mapping from the model to the tree component and filtering the tree based on search results.
 */

const { state } = useStorage();
const props = defineProps<{
  searchText: string;
}>();

const treeData = computed(() => mapStoragesToTreeNodes(state.storage));

const expandNodesAlongPath = (path: Node[]) => {
  // recursive wrapper function
  const expandPathRecursively = (nodes: TreeNodeData[], path: Node[]) => {
    if (path.length === 0) return;

    const [currentNode, ...remainingPath] = path;

    nodes.forEach((node) => {
      if (node.id === currentNode.id) {
        node.expanded = true;
        if (remainingPath.length > 0 && node.children) {
          expandPathRecursively(node.children, remainingPath);
        }
      }
    });
  };

  expandPathRecursively(treeData.value, path);
};


watch(() => props.searchText, (newText) => {
  const results: SearchResult[] = searchNodesByName(newText, state.storage);

  if (results.length === 0) {
    return;
  }

  console.log(results);

  results.forEach((result) => {
    expandNodesAlongPath(result.path);
    map
  });

});

</script>

<template>
  <Tree :nodes="treeData" />
</template>

<style scoped>
</style>
