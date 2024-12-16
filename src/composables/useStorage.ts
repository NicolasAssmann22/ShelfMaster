import { onMounted, reactive } from 'vue';
import type { Item, Storage } from '../types/models';
import { createItem, createStorage } from '../types/models';
import storageData from '../assets/storage-data.json';

const state = reactive({
  storage: [] as Storage[],
});

const useStorage = () => {

  // Load the storage data from the JSON file (for example purposes)
  const loadStorageData = () => {
    const processStorage = (storage: Partial<Storage> & Pick<Storage, 'name'>): Storage => {
      const items = storage.items?.map((item) => createItem(item as Partial<Item> & Pick<Item, 'name'>)) ?? [];
      const children = storage.children?.map((child) => processStorage(child as Partial<Storage> & Pick<Storage, 'name'>)) ?? [];
      return createStorage({ ...storage, items, children });
    };

    state.storage = storageData.storage.map((storage) => {
      // TODO dirty cast -> should be replaced later by conversion logic from JSON to Storage when this stays in the project
      return processStorage(storage as unknown as Partial<Storage> & Pick<Storage, 'name'>);
    });
  };

  onMounted(() => {
    loadStorageData();
  });


  // Helper function to find a storage unit by its id
  const findStorageById = (storageId: string, storages: Storage[]): Storage | null => {
    for (const storage of storages) {
      if (storage.id === storageId) {
        return storage;
      }
      const found = findStorageById(storageId, storage.children);
      if (found) {
        return found;
      }
    }
    return null;
  };

  // Helper function to find an item by its id
  const findItemById = (id: string, units: Storage[]): Item | null => {
    for (const unit of units) {
      for (const item of unit.items) {
        if (item.id === id) {
          return item;
        }
      }
      const found = findItemById(id, unit.children);
      if (found) {
        return found;
      }
    }
    return null;
  };

  /**
   * Add a storage unit to the storage tree.
   * If parentId is null, the storage unit is added to the root level.
   * @param storage
   * @param parentId
   * @throws Error if the parent storage unit is not found.
   */
  const addStorage = (storage: Storage, parentId: string | null) => {
    if (parentId === null) {
      state.storage.push(storage);
    } else {
      const parent = findStorageById(parentId, state.storage);
      if (!parent) {
        throw new Error(`Failed to find storage with id ${parentId}`);
      }
      parent.children.push(storage);
    }
  };

  /**
   * Remove a storage unit from the storage tree.
   * @param storageId The id of the storage unit to remove.
   * @returns true if the storage unit was removed, false otherwise.
   * @throws Error if the storage unit with the given id is not found.
   */
  const removeStorage = (storageId: string) => {
    // recursive wrapper function
    const removeStorageRecursively = (id: string, storages: Storage[]): boolean => {
      for (let i = 0; i < storages.length; i++) {
        if (storages[i].id === id) {
          storages.splice(i, 1);
          return true;
        }
        if (removeStorageRecursively(id, storages[i].children)) {
          return true;
        }
      }
      return false;
    };
    // recursive call
    if (!removeStorageRecursively(storageId, state.storage)) {
      throw new Error(`Failed to remove storage with id ${storageId}`);
    }
  };

  /**
   * Add an item to a storage unit.
   * @param item The item to add.
   * @param parentId The id of the parent storage unit.
   * @throws Error if the parent storage unit is not found.
   */
  const addItem = (item: Item, parentId: string) => {
    item.parentId = parentId
    const parentStorage = findStorageById(parentId, state.storage);
    if (!parentStorage) {
      throw new Error(`Failed to find storage with id ${parentId}`);
    }
    parentStorage.items.push(item);
  };

  /**
   * Remove an item from the storage tree.
   * @param itemId The id of the item to remove.
   * @throws Error if the item with the given id is not found.
   */
  const removeItem = (itemId: string) => {
    const item = findItemById(itemId, state.storage);
    if (!item) {
      throw new Error(`Failed to remove item with id ${itemId}`);
    }
    const parent = findStorageById(item.parentId!, state.storage);
    if (parent) {
      const index = parent.items.findIndex((item) => item.id === itemId);
      if (index !== -1) {
        parent.items.splice(index, 1);
      }
    }
  };

  // export the storage state and methods for usage in other modules
  return {
    // the storage state
    state,
    // methods
    addStorage,
    removeStorage,
    addItem,
    removeItem,
  };
};

export default useStorage;
