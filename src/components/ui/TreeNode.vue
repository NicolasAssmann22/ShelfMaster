<script setup lang="ts">
import type { TreeNodeData } from '../../types/tree';
import { type PropType } from 'vue';
import { computed } from 'vue';
import {useStorageStore} from '../../composables/useStorage';
import TreeNodeField from '../../components/fields/TreeNodeField.vue';

const storageStore = useStorageStore();

const props = defineProps({
  node: {
    type: Object as PropType<TreeNodeData>,
    required: true,
  },
})
defineEmits<{
  (e: 'toggle', node: TreeNodeData): void
}>();
computed(() => {
  return storageStore.findStorageById(props.node.id, storageStore.storage) != null;
});
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
  <li>
    <TreeNodeField :node="node" @toggle="$emit('toggle', $event)" />

    <transition name="expand-fade-y" @before-enter="beforeEnter" @enter="enter" @leave="leave">
      <ul v-if="node.expanded && node.children" class="pl-4 space-y-1">
        <TreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          @toggle="$emit('toggle', $event)"
        />

      </ul>
    </transition>
  </li>

</template>

<style scoped></style>
