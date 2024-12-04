<script setup lang="ts">
import { computed } from 'vue';
import type { StorageNode, Storage, Item } from '../../types/models'
import Tree from 'vue3-tree';
import useHomeLayout from '../../composables/useStorage';

const { state } = useHomeLayout();

console.log(state.storageUnits);

const treeData = computed<StorageNode[]>(() => {
  const mapStorageUnitToNode = (unit: Storage): StorageNode => ({
    id: unit.id,
    label: unit.name,
    children: [
      ...unit.items.map((item: Item): StorageNode => ({
        id: item.id,
        label: `${item.name} (${item.quantity})`,
        children: [], // leaf node has no children
      })),
      ...unit.children.map(mapStorageUnitToNode), // recursive call
    ],
  });

  return state.storageUnits.map(mapStorageUnitToNode) as StorageNode[];
});
</script>

<template>
  <Tree v-model:nodes="treeData" />
</template>

<style scoped>
</style>
