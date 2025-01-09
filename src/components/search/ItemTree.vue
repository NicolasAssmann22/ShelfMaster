<script setup lang="ts">
import { computed, type PropType, ref, watch } from 'vue'
import Tree from '../ui/TreeComponent.vue';
import type { Node } from '../../types/models';
import { mapStoragesToTreeNodes, findTreeNodeById } from '../../utils/treeMapper';
import { useStorageStore } from '../../composables/useStorage';
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

const props = defineProps({
  searchText: {
    type: String,
    default: ''
  },
  dnd: {
    type: Boolean,
    default: false
  }
});

const treeData = computed(() => {
  saveExpandedState();
  const newData = mapStoragesToTreeNodes(storageStore.storage);
  restoreExpandedState(newData);
  return newData;
});

const treeRef = ref<InstanceType<typeof TreeComponent> | null>(null);
const expandedState = ref<Record<string, boolean>>({});
const draggedNode = ref<TreeNodeData | null>(null);

const resetHighlighting = () => {
  if (!treeData.value) return;

  const resetHighlightingRecursive = (nodes: TreeNodeData[]) => {
    nodes.forEach((node) => {
      node.highlighted = false;
      if (node.children) {
        resetHighlightingRecursive(node.children);
      }
    });
  };

  resetHighlightingRecursive(treeData.value);
};

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

const saveExpandedState = () => {
  if (!treeData.value) return;

  const saveExpandedStateRecursive = (nodes: TreeNodeData[]) => {
    nodes.forEach((node) => {
      expandedState.value[node.id] = node.expanded;
      if (node.children) {
        saveExpandedStateRecursive(node.children);
      }
    });
  };
  saveExpandedStateRecursive(treeData.value);
};

const restoreExpandedState = (nodes: TreeNodeData[]) => {
  nodes.forEach(node => {
    if (expandedState.value[node.id] !== undefined) {
      node.expanded = expandedState.value[node.id];
    }
    if (node.children) {
      restoreExpandedState(node.children);
    }
  });
};

const onDragStart = (node: TreeNodeData) => {
  if (!props.dnd) {
    return;
  }
  draggedNode.value = node;
};

const onDragOver = (targetNode: TreeNodeData) => {
  if (!props.dnd || !draggedNode.value) {
    return;
  }
  resetHighlighting();
  if (storageStore.canMoveTo(draggedNode.value.id, targetNode.id)) {
    targetNode.highlighted = true;
  }
};

const onDragEnd = () => {
  draggedNode.value = null;
  resetHighlighting();
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

const handleNodeDrop = (draggedNode: TreeNodeData, targetNode: TreeNodeData) => {
  if (!props.dnd || !draggedNode) {
    return;
  }
  if (storageStore.canMoveTo(draggedNode.id, targetNode.id, true)) {
    storageStore.moveNode(draggedNode.id, targetNode.id);
  }
};

</script>

<template>
  <Tree
    :nodes="treeData"
    :dnd="props.dnd"
    ref="treeRef"
    @dragstart="onDragStart"
    @dragover="onDragOver"
    @dragend="onDragEnd"
    @node-drop="handleNodeDrop"
  />
</template>

<style scoped>
</style>
