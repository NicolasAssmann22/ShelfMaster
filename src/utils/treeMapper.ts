import type { Item, Storage } from '../types/models';
import { getDefaultIcon } from '../types/models';
import type { TreeNodeData } from '../types/tree';
import { reactive } from 'vue';

let nodeLookup: Record<string, TreeNodeData> = {};

/**
 * Maps a Storage to TreeNodeData and populates the lookup map.
 * @param storage
 */
export const mapStorageToTreeNode = (storage: Storage): TreeNodeData => {
  const node = reactive({
    id: storage.id,
    label: storage.name,
    expanded: false,
    highlighted: false,
    icon: storage.icon ?? getDefaultIcon(storage),
    children: [
      ...storage.items.map(
        (item: Item): TreeNodeData => {
          const itemNode = reactive({
            id: item.id,
            label: `${item.name} (${item.quantity})`,
            expanded: false,
            highlighted: false,
            children: [],
            icon: item.icon ?? getDefaultIcon(item),
          });
          nodeLookup[item.id] = itemNode;
          return itemNode;
        }
      ),
      ...storage.children.map(mapStorageToTreeNode), // Recursively process child storages
    ],
  });
  nodeLookup[storage.id] = node;
  return node;
};

/**
 * Maps an array of Storages to an array of TreeNodeData and populates the lookup map.
 * @param storages
 */
export const mapStoragesToTreeNodes = (storages: Storage[]): TreeNodeData[] => {
  nodeLookup = {}; // Reset the lookup map
  return storages.map(mapStorageToTreeNode);
};

/**
 * Finds a TreeNodeData by its ID.
 * @param id
 */
export const findTreeNodeById = (id: string): TreeNodeData | undefined => {
  return nodeLookup[id];
};
