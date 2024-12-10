import { onMounted, reactive } from 'vue';
import type { Item, Storage } from '../types/models';
import { createItem, createStorage } from '../types/models';
import storageData from '../assets/storage-data.json';

const state = reactive({
  storage: [] as Storage[],
});

const useStorage = () => {
  /**
   * For testing purposes, we can load some initial storage data.
    */
  const loadStorageData = () => {
    state.storage = storageData.storage.map((storage) => {
      const items = storage.items.map((item: unknown) => createItem(item as Omit<Item, 'name'>))
      const children = storage.children.map((child: unknown) => createStorage(child as Omit<Storage, 'name'>))
      return createStorage({ ...storage, items, children } as Omit<Storage, 'name'> & Partial<Storage>);
    })
  };
  onMounted(() => {
    loadStorageData()
  });

  // Helper function to find a storage unit by its ID, accessible by other methods
  const findStorageUnitById = (id: string, units: Storage[]): Storage | null => {
    for (const unit of units) {
      if (unit.id === id) {
        return unit
      }
      const found = findStorageUnitById(id, unit.children) // Recursive search
      if (found) {
        return found
      }
    }
    return null
  };

  const findItemById = (id: string, units: Storage[]): Item | null => {
    for (const unit of units) {
      for (const item of unit.items) {
        if (item.id === id) {
          return item
        }
      }
      const found = findItemById(id, unit.children) // Recursive search
      if (found) {
        return found
      }
    }
    return null
  };

  return {
    state,

    // Add a new storage unit (arbitrary level in the hierarchy)
    addStorageUnit(parentId: string | null, unit: Storage) {
      if (parentId === null) {
        state.storage.push(unit) // Add to root level if no parent
      } else {
        const parent = findStorageUnitById(parentId, state.storage)
        if (parent) {
          parent.children.push(unit) // Add as child of another storage unit
        }
      }
    },

    removeStorageUnit(id: string) {
      const removeUnit = (id: string, units: Storage[]): boolean => {
        for (let i = 0; i < units.length; i++) {
          if (units[i].id === id) {
            units.splice(i, 1)
            return true
          }
          if (removeUnit(id, units[i].children)) {
            return true
          }
        }
        return false
      }
      removeUnit(id, state.storage)
    },

    // Add an item to a storage unit (any level)
    addItem(item: Item, parentId: string) {
      item.parentId = parentId
      // TODO handle case where storage unit is not found
      findStorageUnitById(parentId, state.storage)?.items.push(item)
    },

    removeItem(itemId: string) {
      const item = findItemById(itemId, state.storage)
      if (!item) {
        throw new Error(`Failed to remove item with id ${itemId}`)
      }

      const parent = findStorageUnitById(item.parentId!, state.storage)
      if (parent) {
        const index = parent.items.findIndex((item) => item.id === itemId)
        if (index !== -1) {
          parent.items.splice(index, 1)
        }
      }
    },
  };
}

export default useStorage;
