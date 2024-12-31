<script setup lang="ts">
import type { TreeNodeData } from '@/types/tree'
import { defineProps, type PropType } from 'vue'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import * as OutlineIcons from '@heroicons/vue/24/outline'
import AddField from "@/components/fields/AddField.vue";
import { computed } from 'vue'
import {useStorageStore} from "@/composables/useStorage";

const storageStore = useStorageStore();

const props = defineProps({
  node: {
    type: Object as PropType<TreeNodeData>,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'toggle', node: TreeNodeData): void
}>()

const handleClick = (event: MouseEvent) => {
  event.stopPropagation()
  emit('toggle', props.node)
}

const getIconComponent = (iconName: string) => {
  return OutlineIcons[iconName as keyof typeof OutlineIcons] // Return the component if it exists
}

const isStorageNode = computed(() => {
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
    <div
      @click="handleClick"
      :class="['flex items-center space-x-2 cursor-pointer p-2 rounded', { highlighted: node.highlighted }]"
    >
      <div class="flex items-center space-x-2 flex-grow">
    <span v-if="node.icon" class="text-gray-500">
      <!-- Dynamically render the icon -->
      <component :is="getIconComponent(node.icon)" class="w-5 h-5 text-gray-500" />
    </span>
        <span class="font-medium">{{ node.label }}</span>
        <span v-if="node.children?.length" class="text-gray-500">
      <ChevronDownIcon v-if="node.expanded" class="w-5 h-5 text-gray-500"></ChevronDownIcon>
      <ChevronRightIcon v-else class="w-5 h-5 text-gray-500"></ChevronRightIcon>
    </span>
      </div>

      <!-- Align AddField to the right -->
      <AddField v-if="isStorageNode" :node="node" />
    </div>




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
