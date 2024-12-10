<script setup lang="ts">
import { computed } from 'vue';
import Tree from '../ui/TreeComponent.vue';
import { mapStoragesToTreeNodes } from '../../utils/treeMapper';
import useStorage from '../../composables/useStorage';

const { state } = useStorage();

const treeData = computed(() => mapStoragesToTreeNodes(state.storage));
</script>

<template>
  <Tree :nodes="treeData" />
</template>

<style scoped>
</style>
