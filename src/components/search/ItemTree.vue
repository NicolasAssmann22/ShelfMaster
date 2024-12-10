<script setup lang="ts">
import { computed } from 'vue';
import Tree from '../ui/TreeComponent.vue';
import { mapStoragesToTreeNodes } from '../../utils/treeMapper';
import useHomeLayout from '../../composables/useStorage';

const { state } = useHomeLayout();

const treeData = computed(() => mapStoragesToTreeNodes(state.storageUnits));
</script>

<template>
  <Tree :nodes="treeData" />
</template>

<style scoped>
</style>
