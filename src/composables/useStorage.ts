import { defineStore } from 'pinia'
import type { Item, Storage } from '../types/models'
import { createItem, createStorage } from '../types/models'
import storageData from '../assets/storage-data.json'

export const useStorageStore = defineStore('storage', {
  // Define the initial state
  state: () => ({
    storage: [] as Storage[],
  }),

  // Define actions
  actions: {
    // Load the storage data from the JSON file (for example purposes)
    loadStorageData() {
      const storedData = localStorage.getItem('storageData')
      if (storedData) {
        this.storage = JSON.parse(storedData)
      } else {
        console.log('Loading storage data...')
        // Wenn keine Daten im localStorage sind, lade sie von der JSON-Datei oder initialisiere sie
        const processStorage = (storage: Partial<Storage> & Pick<Storage, 'name'>): Storage => {
          const items =
            storage.items?.map((item: Item) =>
              createItem(item as Partial<Item> & Pick<Item, 'name'>),
            ) ?? []
          const children =
            storage.children?.map((child: Storage) =>
              processStorage(child as Partial<Storage> & Pick<Storage, 'name'>),
            ) ?? []
          return createStorage({ ...storage, items, children })
        }

        this.storage = storageData.storage.map((storage) => {
          return processStorage(storage as unknown as Partial<Storage> & Pick<Storage, 'name'>)
        })
      }
    },

    // Helper function to find a storage unit by its id
    findStorageById(storageId: string, storages: Storage[]): Storage | null {
      for (const storage of storages) {
        if (storage.id === storageId) {
          return storage
        }
        const found = this.findStorageById(storageId, storage.children)
        if (found) {
          return found
        }
      }
      return null
    },

    // Helper function to find an item by its id
    findItemById(id: string, units: Storage[]): Item | null {
      for (const unit of units) {
        for (const item of unit.items) {
          if (item.id === id) {
            return item
          }
        }
        const found = this.findItemById(id, unit.children)
        if (found) {
          return found
        }
      }
      return null
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
        this.storage.push(storage)
      } else {
        const parent = this.findStorageById(parentId, this.storage)
        if (!parent) {
          throw new Error(`Failed to find storage with id ${parentId}`)
        }
        parent.children.push(storage)
      }

      // Speichern der aktualisierten Daten im localStorage
      this.saveStorageToLocalStorage()
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
            storages.splice(i, 1)
            return true
          }
          if (removeStorageRecursively(id, storages[i].children)) {
            return true
          }
        }
        return false
      }

      if (!removeStorageRecursively(storageId, this.storage)) {
        throw new Error(`Failed to remove storage with id ${storageId}`)
      }
    },

    /**
     * Add an item to a storage unit.
     * @param item The item to add.
     * @param parentId The id of the parent storage unit.
     * @throws Error if the parent storage unit is not found.
     */
    addItem(item: Item, parentId: string) {
      item.parentId = parentId
      const parentStorage = this.findStorageById(parentId, this.storage)
      if (!parentStorage) {
        throw new Error(`Failed to find storage with id ${parentId}`)
      }
      parentStorage.items.push(item)

      // Speichern der aktualisierten Daten im localStorage
      this.saveStorageToLocalStorage()
    },

    /**
     * Remove an item from the storage tree.
     * @param itemId The id of the item to remove.
     * @throws Error if the item with the given id is not found.
     */
    removeItem(itemId: string) {
      const item = this.findItemById(itemId, this.storage)
      if (!item) {
        throw new Error(`Failed to remove item with id ${itemId}`)
      }
      const parent = this.findStorageById(item.parentId!, this.storage)
      if (parent) {
        const index = parent.items.findIndex((item: Item) => item.id === itemId)
        if (index !== -1) {
          parent.items.splice(index, 1)
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
          const currentPath = [...path, storage.name] // Append current storage name to path
          if (storage.id === id) {
            return currentPath
          }
          const result = findPath(id, storage.children, currentPath)
          if (result) {
            return result
          }
        }
        return null
      }

      return findPath(storageId, this.storage, [])
    },

    saveStorageToLocalStorage() {
      localStorage.setItem('storageData', JSON.stringify(this.storage))
    },

    /**
     * Find a node (Item or Storage) by its ID.
     * @param id The ID of the node to find.
     * @param storages The array of storages to search within.
     * @returns The found node (Item or Storage), or null if not found.
     */
    findNodeById(id: string, storages: Storage[]): Node | null {
      for (const storage of storages) {
        if (storage.id === id) {
          return storage // Found a storage node
        }

        for (const item of storage.items) {
          if (item.id === id) {
            return item // Found an item node
          }
        }

        // Recursive search in child storages
        const foundInChildren = findNodeById(id, storage.children)
        if (foundInChildren) {
          return foundInChildren
        }
      }

      return null // Node not found
    },
    /**
     * Update an existing Item in the storage tree.
     * If the hierarchy changes, the corresponding `parentId` of the Item will be updated.
     * @param updatedItem The updated item.
     * @param newParentId The new parent ID for the item (if moving the item to another storage).
     * @throws Error if the item with the given id is not found.
     */
    updateItem(updatedItem: Item, newParentId?: string | null) {
      // Find the item to update
      const item = this.findItemById(updatedItem.id, this.storage)
      if (!item) {
        throw new Error(`Failed to find item with id ${updatedItem.id}`)
      }

      // Handle hierarchy change if `newParentId` is provided
      if (newParentId !== undefined) {
        const oldParent = this.findStorageById(item.parentId!, this.storage)
        const newParent = this.findStorageById(newParentId, this.storage)

        if (!newParent) {
          throw new Error(`Failed to find new parent storage with id ${newParentId}`)
        }

        // Remove item from old parent
        if (oldParent) {
          const index = oldParent.items.findIndex((i) => i.id === updatedItem.id)
          if (index !== -1) {
            oldParent.items.splice(index, 1)
          }
        }

        // Add item to new parent
        newParent.items.push(updatedItem)

        // Update parentId of the item
        updatedItem.parentId = newParentId
      }

      // Update the item's properties
      Object.assign(item, updatedItem)

      // Save the updated storage data
      this.saveStorageToLocalStorage()
    },
    /**
     * Update an existing Storage in the storage tree.
     * If the hierarchy changes, the corresponding `parentId` of the Storage will be updated.
     * @param updatedStorage The updated storage.
     * @param newParentId The new parent ID for the storage (if moving the storage to another storage).
     * @throws Error if the storage with the given id is not found.
     */
    updateStorage(updatedStorage: Storage, newParentId?: string | null) {
      // Find the storage to update
      const storage = this.findStorageById(updatedStorage.id, this.storage)
      if (!storage) {
        throw new Error(`Failed to find storage with id ${updatedStorage.id}`)
      }

      // Handle hierarchy change if `newParentId` is provided
      if (newParentId !== undefined) {
        const oldParent = this.findStorageById(storage.parentId!, this.storage)
        const newParent = this.findStorageById(newParentId, this.storage)

        if (!newParent) {
          throw new Error(`Failed to find new parent storage with id ${newParentId}`)
        }

        // Remove storage from old parent
        if (oldParent) {
          const index = oldParent.children.findIndex((child) => child.id === updatedStorage.id)
          if (index !== -1) {
            oldParent.children.splice(index, 1)
          }
        }

        // Add storage to new parent
        newParent.children.push(updatedStorage)

        // Update parentId of the storage
        updatedStorage.parentId = newParentId
      }

      // Update the storage's properties
      Object.assign(storage, updatedStorage)

      // Save the updated storage data
      this.saveStorageToLocalStorage()
    },
  },
})
