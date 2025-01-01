import { defineStore } from 'pinia';
import type { Item, Storage } from '@/types/models';
import { createItem, createStorage } from '@/types/models';
import storageData from '../assets/storage-data.json';

export const useStorageStore = defineStore('storage', {
  // Define the initial state
  state: () => ({
    storage: [] as Storage[],
  }),

  // Define actions
  actions: {
    // Load the storage data from the JSON file (for example purposes)
    loadStorageData() {
      const storedData = localStorage.getItem('storageData');
      if (storedData) {
        this.storage = JSON.parse(storedData);
      } else {
        console.log('Loading storage data...');
        // Wenn keine Daten im localStorage sind, lade sie von der JSON-Datei oder initialisiere sie
        const processStorage = (storage: Partial<Storage> & Pick<Storage, 'name'>): Storage => {
          const items = storage.items?.map((item) => createItem(item as Partial<Item> & Pick<Item, 'name'>)) ?? [];
          const children = storage.children?.map((child) => processStorage(child as Partial<Storage> & Pick<Storage, 'name'>)) ?? [];
          return createStorage({ ...storage, items, children });
        };

        this.storage = storageData.storage.map((storage) => {
          return processStorage(storage as unknown as Partial<Storage> & Pick<Storage, 'name'>);
        });
      }
    },

    // Helper function to find a storage unit by its id
    findStorageById(storageId: string, storages: Storage[]): Storage | null {
      for (const storage of storages) {
        if (storage.id === storageId) {
          return storage;
        }
        const found = this.findStorageById(storageId, storage.children);
        if (found) {
          return found;
        }
      }
      return null;
    },

    // Helper function to find an item by its id
    findItemById(id: string, units: Storage[]): Item | null {
      for (const unit of units) {
        for (const item of unit.items) {
          if (item.id === id) {
            return item;
          }
        }
        const found = this.findItemById(id, unit.children);
        if (found) {
          return found;
        }
      }
      return null;
    },

    /**
     * Add a storage unit to the storage tree.
     * If parentId is null, the storage unit is added to the root level.
     * @param storage
     * @param parentId
     * @throws Error if the parent storage unit is not found.
     */
    addStorage(storage: Storage, parentId: string | null) {
      if (parentId === null) {
        this.storage.push(storage);
      } else {
        const parent = this.findStorageById(parentId, this.storage);
        if (!parent) {
          throw new Error(`Failed to find storage with id ${parentId}`);
        }
        parent.children.push(storage);
      }

      // Speichern der aktualisierten Daten im localStorage
      this.saveStorageToLocalStorage();
    },

    /**
     * Remove a storage unit from the storage tree.
     * @param storageId The id of the storage unit to remove.
     * @returns true if the storage unit was removed, false otherwise.
     * @throws Error if the storage unit with the given id is not found.
     */
    removeStorage(storageId: string) {
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

      if (!removeStorageRecursively(storageId, this.storage)) {
        throw new Error(`Failed to remove storage with id ${storageId}`);
      }
    },

    /**
     * Add an item to a storage unit.
     * @param item The item to add.
     * @param parentId The id of the parent storage unit.
     * @throws Error if the parent storage unit is not found.
     */
    addItem(item: Item, parentId: string) {
      item.parentId = parentId;
      const parentStorage = this.findStorageById(parentId, this.storage);
      if (!parentStorage) {
        throw new Error(`Failed to find storage with id ${parentId}`);
      }
      parentStorage.items.push(item);

      // Speichern der aktualisierten Daten im localStorage
      this.saveStorageToLocalStorage();
    },

    /**
     * Remove an item from the storage tree.
     * @param itemId The id of the item to remove.
     * @throws Error if the item with the given id is not found.
     */
    removeItem(itemId: string) {
      const item = this.findItemById(itemId, this.storage);
      if (!item) {
        throw new Error(`Failed to remove item with id ${itemId}`);
      }
      const parent = this.findStorageById(item.parentId!, this.storage);
      if (parent) {
        const index = parent.items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          parent.items.splice(index, 1);
        }
      }
    },

    /**
     * Get the path of a storage unit by its id.
     * The path is represented as an array of storage names.
     * @param storageId The id of the storage unit.
     * @returns The path as an array of storage names, or null if the storage is not found.
     */
    getStoragePath(storageId: string): string[] | null {
      const findPath = (id: string, storages: Storage[], path: string[]): string[] | null => {
        for (const storage of storages) {
          const currentPath = [...path, storage.name]; // Append current storage name to path
          if (storage.id === id) {
            return currentPath;
          }
          const result = findPath(id, storage.children, currentPath);
          if (result) {
            return result;
          }
        }
        return null;
      };

      return findPath(storageId, this.storage, []);
    },


    saveStorageToLocalStorage() {
      localStorage.setItem('storageData', JSON.stringify(this.storage));
    },
  },
});
