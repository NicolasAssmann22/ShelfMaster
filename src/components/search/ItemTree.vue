<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type TreeComponent from '../ui/TreeComponent.vue'
import Tree from '../ui/TreeComponent.vue'
import type { Node } from '../../types/models'
import { findTreeNodeById, mapStoragesToTreeNodes } from '../../utils/treeMapper'
import { useStorageStore } from '../../composables/useStorage'
import { filterTreeByCategory, searchNodesByName, searchItemsByCategoryName, type SearchResult } from '../../utils/search'
import type { TreeNodeData } from '../../types/tree'
import { useCategoryStore } from '../../composables/categoryStorage'

/**
 * This component handles domain-specific logic such as mapping from the model to the tree component and filtering the tree based on search results.
 */

const storageStore = useStorageStore()
const categoryStore = useCategoryStore()

const props = defineProps({
  searchText: {
    type: String,
    default: '',
  },
  categoryId: {
    type: String,
    default: '',
  },
  dnd: {
    type: Boolean,
    default: false,
  },
})

const treeData = ref(storageStore.storage)

const displayTreeData = computed(() => {
  saveExpandedState()
  const newData = mapStoragesToTreeNodes(treeData.value)
  restoreExpandedState(newData)
  return newData
})

const treeRef = ref<InstanceType<typeof TreeComponent> | null>(null)
const expandedState = ref<Record<string, boolean>>({})
const draggedNode = ref<TreeNodeData | null>(null)

watch(
  () => props.searchText,
  (searchText) => {
    handleSearch(searchText)
  },
)

const handleSearch = (searchText: string) => {
  const nameResults: SearchResult[] = searchNodesByName(searchText, treeData.value)
  const categoryResults: SearchResult[] = searchItemsByCategoryName(searchText, treeData.value, categoryStore.categories)

  if (nameResults.length === 0 && categoryResults.length === 0) {
    return
  }

  const results = nameResults.concat(categoryResults)

  treeRef.value!.collapseAllNodes()
  treeRef.value!.resetHighlighting()

  results.forEach((result) => {
    expandNodesAlongPath(result.path)
    result.path.forEach((node: Node) => {
      const treeNode = findTreeNodeById(node.id)
      if (treeNode) {
        treeRef.value!.highlightNode(treeNode)
      }
    })
  })
}

watch(
  () => props.categoryId,
  (categoryId) => {
    handleFilter(categoryId)
  },
)

const handleFilter = (categoryId: string) => {
  if (!categoryId || categoryId === '') {
    resetFilter()
  } else {
    filterByCategory(categoryId)
  }
}

const filterByCategory = (categoryId: string) => {
  if (!displayTreeData.value) return
  treeData.value = filterTreeByCategory(categoryId, storageStore.storage)
}

const resetFilter = () => {
  treeData.value = storageStore.storage
}

const resetHighlighting = () => {
  if (!treeData.value) return

  const resetHighlightingRecursive = (nodes: TreeNodeData[]) => {
    nodes.forEach((node) => {
      node.highlighted = false
      if (node.children) {
        resetHighlightingRecursive(node.children)
      }
    })
  }

  resetHighlightingRecursive(displayTreeData.value)
}

const expandNodesAlongPath = (path: Node[]) => {
  // recursive wrapper function
  const expandPathRecursively = (nodes: TreeNodeData[], path: Node[]) => {
    if (path.length === 0) return

    const [currentNode, ...remainingPath] = path

    nodes.forEach((node) => {
      if (node.id === currentNode.id) {
        treeRef.value!.expandNode(node)
        if (remainingPath.length > 0 && node.children) {
          expandPathRecursively(node.children, remainingPath)
        }
      }
    })
  }

  expandPathRecursively(displayTreeData.value, path)
}

const saveExpandedState = () => {
  if (!displayTreeData.value) return

  const saveExpandedStateRecursive = (nodes: TreeNodeData[]) => {
    nodes.forEach((node) => {
      expandedState.value[node.id] = node.expanded
      if (node.children) {
        saveExpandedStateRecursive(node.children)
      }
    })
  }
  saveExpandedStateRecursive(displayTreeData.value)
}

const restoreExpandedState = (nodes: TreeNodeData[]) => {
  nodes.forEach((node) => {
    if (expandedState.value[node.id] !== undefined) {
      node.expanded = expandedState.value[node.id]
    }
    if (node.children) {
      restoreExpandedState(node.children)
    }
  })
}

const onDragStart = (node: TreeNodeData) => {
  if (!props.dnd) {
    return
  }
  draggedNode.value = node
}

const onDragOver = (targetNode: TreeNodeData) => {
  if (!props.dnd || !draggedNode.value) {
    return
  }
  resetHighlighting()
  if (storageStore.canMoveTo(draggedNode.value.id, targetNode.id)) {
    targetNode.highlighted = true
  }
}

const onDragEnd = () => {
  draggedNode.value = null
  resetHighlighting()
}

const handleNodeDrop = (draggedNode: TreeNodeData, targetNode: TreeNodeData) => {
  if (!props.dnd || !draggedNode) {
    return
  }
  if (storageStore.canMoveTo(draggedNode.id, targetNode.id, true)) {
    storageStore.moveNode(draggedNode.id, targetNode.id)
  }
}
</script>

<template>
  <Tree
    :nodes="displayTreeData"
    :dnd="props.dnd"
    ref="treeRef"
    @dragstart="onDragStart"
    @dragover="onDragOver"
    @dragend="onDragEnd"
    @node-drop="handleNodeDrop"
  />
</template>

<style scoped></style>
