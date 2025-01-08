<script setup lang="ts">
import { type PropType, computed } from 'vue'
import type { TreeNodeData } from '../../types/tree';
import {useStorageStore} from '../../composables/useStorage';
import TreeNodeField from '../../components/fields/TreeNodeField.vue';

const storageStore = useStorageStore();

const props = defineProps({
  node: {
    type: Object as PropType<TreeNodeData>,
    required: true,
  },
  dnd: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'toggle', node: TreeNodeData): void
  (e: 'dragstart', node: TreeNodeData): void
  (e: 'drop', node: TreeNodeData): void
}>();


computed(() => {
  return storageStore.findStorageById(storageStore.storage, props.node.id) != null;
})

const handleDragStart = (event: DragEvent, node: TreeNodeData): void => {
  if (props.dnd) {
    event.stopPropagation();
    emit('dragstart', node);
  }
}

const onDragOver = (event: DragEvent): void => {
  if (props.dnd) {
    event.preventDefault();
  }
}

const onDrop = (event: DragEvent, node: TreeNodeData): void => {
  if (props.dnd) {
    event.preventDefault();
    emit('drop', node);
  }
}

const onToggle = (node: TreeNodeData): void => {
  emit('toggle', node)
}

// Transition Hooks
const beforeEnter = (el: Element): void => {
  const htmlEl = el as HTMLElement
  htmlEl.style.transform = 'scaleY(0)'
  // htmlEl.style.height = '0';
  htmlEl.style.opacity = '0'
  htmlEl.style.transformOrigin = 'top' // scaling should start from bottom
}

const enter = (el: Element): void => {
  const htmlEl = el as HTMLElement
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  htmlEl.offsetHeight // Trigger reflow for animation
  htmlEl.style.transition = 'transform 0.3s ease, opacity 0.3s ease'
  htmlEl.style.transform = 'scaleY(1)' // expand vertically
  // htmlEl.style.height = `${(el as HTMLElement).scrollHeight}px`;
  htmlEl.style.opacity = '1' // fade in
}

const leave = (el: Element): void => {
  const htmlEl = el as HTMLElement
  htmlEl.style.transform = 'scaleY(0)'
  // htmlEl.style.height = '0';
  htmlEl.style.opacity = '0' // fade out
}
</script>

<template>
  <li
    :draggable="dnd"
    @dragstart="handleDragStart($event, node)"
    @dragover="onDragOver"
    @drop="onDrop($event, node)"
  >
    <TreeNodeField
      :node="node"
      :draggable="dnd"
      @dragstart.stop="handleDragStart($event, node)"
      @toggle="onToggle"
    />

    <transition
      name="expand-fade-y"
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave">
      <ul
        v-if="node.expanded && node.children"
        class="pl-4 space-y-1">
        <TreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :dnd="dnd"
          @dragstart="$emit('dragstart', $event)"
          @drop="$emit('drop', $event)"
          @toggle="$emit('toggle', $event)"
        />
      </ul>
    </transition>
  </li>

</template>

<style scoped></style>
