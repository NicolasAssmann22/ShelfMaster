import type { Item, Storage } from '../types/models'
import type { TreeNodeData } from '../types/tree'

/**
 * Maps a Storage to TreeNodeData.
 * @param storage
 */
export const mapStorageToTreeNode = (storage: Storage): TreeNodeData => {
  return {
    id: storage.id,
    label: storage.name,
    children: [
      ...storage.items.map(
        (item: Item): TreeNodeData => ({
          id: item.id,
          label: `${item.name} (${item.quantity})`,
          expanded: false,
        }),
      ),
      ...storage.children.map(mapStorageToTreeNode),
    ],
    expanded: false,
  }
}

/**
 * Maps an array of Storages to an array of TreeNodeData
 * @param storages
 */
export const mapStoragesToTreeNodes = (storages: Storage[]): TreeNodeData[] => {
  return storages.map(mapStorageToTreeNode)
}
