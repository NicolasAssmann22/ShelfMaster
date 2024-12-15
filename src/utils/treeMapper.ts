import type { Item, Storage } from '../types/models'
import { getDefaultIcon } from '../types/models'
import type { TreeNodeData } from '../types/tree'
import { reactive } from 'vue'

/**
 * Maps a Storage to TreeNodeData.
 * @param storage
 */
export const mapStorageToTreeNode = (storage: Storage): TreeNodeData => {
  return reactive({
    id: storage.id,
    label: storage.name,
    expanded: false,
    highlighted: false,
    icon: storage.icon ?? getDefaultIcon(storage),
    children: [
      ...storage.items.map(
        (item: Item): TreeNodeData =>
          reactive({
            id: item.id,
            label: `${item.name} (${item.quantity})`,
            expanded: false, // This is also reactive
            highlighted: false,
            children: [],
            icon: item.icon ?? getDefaultIcon(item),
          }),
      ),
      ...storage.children.map(mapStorageToTreeNode), // Recursively process child storages
    ],
  })
}

/**
 * Maps an array of Storages to an array of TreeNodeData
 * @param storages
 */
export const mapStoragesToTreeNodes = (storages: Storage[]): TreeNodeData[] => {
  return storages.map(mapStorageToTreeNode)
}
