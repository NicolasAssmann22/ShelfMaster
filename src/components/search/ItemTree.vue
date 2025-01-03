<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Tree from '../ui/TreeComponent.vue';
import type { Node } from '../../types/models';
import { mapStoragesToTreeNodes, findTreeNodeById } from '../../utils/treeMapper';
import {useStorageStore} from '../../composables/useStorage';
import { type SearchResult, searchNodesByName } from '../../utils/search';
import type { TreeNodeData } from '../../types/tree';
import type TreeComponent from '../ui/TreeComponent.vue';
import { onMounted } from 'vue';

/**
 * This component handles domain-specific logic such as mapping from the model to the tree component and filtering the tree based on search results.
 */

const storageStore = useStorageStore();

onMounted(() => {
  storageStore.loadStorageData();
});
const props = defineProps<{
  searchText: string;
}>();

const treeData = computed(() => mapStoragesToTreeNodes(storageStore.storage));
const treeRef = ref<InstanceType<typeof TreeComponent> | null>(null);

const expandNodesAlongPath = (path: Node[]) => {
  // recursive wrapper function
  const expandPathRecursively = (nodes: TreeNodeData[], path: Node[]) => {
    if (path.length === 0) return;

    const [currentNode, ...remainingPath] = path;

    nodes.forEach((node) => {
      if (node.id === currentNode.id) {
        treeRef.value!.expandNode(node);
        if (remainingPath.length > 0 && node.children) {
          expandPathRecursively(node.children, remainingPath);
        }
      }
    });
  };

  expandPathRecursively(treeData.value, path);
};


watch(() => props.searchText, (newText) => {
  const results: SearchResult[] = searchNodesByName(newText, storageStore.storage);

  if (results.length === 0) {
    return;
  }

  console.log(storageStore.storage);
  console.log(results);

  treeRef.value!.collapseAllNodes();
  treeRef.value!.resetHighlighting();

  results.forEach((result) => {
    expandNodesAlongPath(result.path);
    result.path.forEach((node: Node) => {
      const treeNode = findTreeNodeById(node.id);
      if (treeNode) {
        treeRef.value!.highlightNode(treeNode);
      }
    });
  });

});

</script>

<template>
  <Tree :nodes="treeData" ref="treeRef" />
</template>

<style scoped>
</style>
