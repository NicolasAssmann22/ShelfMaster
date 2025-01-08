import { defineStore } from 'pinia'
import type { Node, Item, Storage } from '../types/models'
import { createItem, createStorage } from '../types/models'
import storageData from '../assets/storage-data.json'

/************************* private helper functions *************************/

// save the storage data to localStorage
const saveToLocalStorage = (storage: Storage[]) => {
  localStorage.setItem('storageData', JSON.stringify(storage))
}

// populate parent IDs for each storage unit.
// This has to be done after creating the item and storage objects as the ids are only present after object creation.
const populateParentIds = (storages: Storage[], parentId: string | undefined = undefined) => {
  for (const storage of storages) {
    storage.parentId = parentId
    storage.items.forEach((item) => {
      item.parentId = storage.id
    })
    populateParentIds(storage.children, storage.id)
  }
}

// check if a node is a Storage
const isStorage = (node: Node): node is Storage => {
  return 'children' in node;
}

// check if a node is an Item
const isItem = (node: Node): node is Item => {
  return 'quantity' in node
}

// find a node by its id
const findNodeById = (storages: Storage[], id: string, ): Node | null => {
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
    const foundInChildren = findNodeById(storage.children, id)
    if (foundInChildren) {
      return foundInChildren
    }
  }

  return null // Node not found
}

// check if a node is a descendant of another node
const isDescendant = (storages: Storage[], nodeId: string, potentialAncestorId: string): boolean => {
  const node = findNodeById(storages, nodeId);
  if (!node) return false;

  if (isStorage(node)) {
    const subStorage = node as Storage;
    for (const child of subStorage.children) {
      if (child.id === potentialAncestorId || isDescendant(storages, child.id, potentialAncestorId)) {
        return true;
      }
    }
  }
  return false;
}

const getParentStorage = (storage: Storage[], newParentId: string): Storage | null => {
  const parentNode = findNodeById(storage, newParentId);
  if (parentNode && isItem(parentNode)) {
    const item = parentNode as Item;
    return item.parentId ? findNodeById(storage, item.parentId) as Storage : null;
  }
  return parentNode as Storage | null;
}

const moveNodeToStorage = (
  node: Node,
  targetStorage: Storage,
  deleteNode: (id: string) => void, // references needed as functions are defined in the scope of the store
  addStorage: (storage: Storage, parentId: string | null) => void,
  addItem: (item: Item, parentId: string) => void
) => {
  if (isStorage(node)) {
    const storage = node as Storage;
    if (!targetStorage.children.find((child) => child.id === storage.id)) {
      deleteNode(storage.id);
      addStorage(storage, targetStorage.id);
    }
  } else if (isItem(node)) {
    const item = node as Item;
    if (!targetStorage.items.find((child) => child.id === item.id)) {
      deleteNode(item.id);
      addItem(item, targetStorage.id);
    }
  }
};


/************************* exposed functions *************************/

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
            storage.items?.map((item: Item) => createItem(item as Partial<Item> & Pick<Item, 'name'>)) ?? []
          const children =
            storage.children?.map((child: Storage) =>
              processStorage(child as Partial<Storage> & Pick<Storage, 'name'>),
            ) ?? []
          return createStorage({ ...storage, items, children })
        }

        this.storage = storageData.storage.map((storage) => {
          return processStorage(storage as unknown as Partial<Storage> & Pick<Storage, 'name'>)
        })

        // Populate parent IDs for each storage unit
        populateParentIds(this.storage)
      }
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
        const parent = this.findStorageById(parentId)
        if (!parent) {
          throw new Error(`Failed to find storage with id ${parentId}`)
        }
        storage.parentId = parentId
        parent.children.push(storage)
      }

      // Store the updated data in localStorage
      saveToLocalStorage(this.storage)
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
      const parentStorage = this.findStorageById(parentId)
      if (!parentStorage) {
        throw new Error(`Failed to find storage with id ${parentId}`)
      }
      item.parentId = parentId
      parentStorage.items.push(item)

      // Speichern der aktualisierten Daten im localStorage
      saveToLocalStorage(this.storage)
    },

    /**
     * Remove an item from the storage tree.
     * @param itemId The id of the item to remove.
     * @throws Error if the item with the given id is not found.
     */
    removeItem(itemId: string) {
      const item = this.findItemById(itemId)
      if (!item) {
        throw new Error(`Failed to remove item with id ${itemId}`)
      }
      const parent = this.findStorageById(item.parentId!)
      if (parent) {
        const index = parent.items.findIndex((item: Item) => item.id === itemId)
        if (index !== -1) {
          parent.items.splice(index, 1)
        }
      }
    },

    /**
     * Find a storage by its ID.
     * @param storageId The ID of the storage to find.
     * @returns The found storage, or null if not found.
     */
    findStorageById(storageId: string): Storage | null {
      const node = this.findNodeById(this.storage, storageId);
      return node && isStorage(node) ? (node as Storage) : null;
    },

    /**
     * Find an item by its ID.
     * @param itemId The ID of the item to find.
     * @returns The found item, or null if not found.
     */
    findItemById(itemId: string): Item | null {
      const node = this.findNodeById(this.storage, itemId);
      return node && isItem(node) ? (node as Item) : null;
    },

    /**
     * Get the path of a storage by its id.
     * The path is represented as an array of storage names.
     * @param storageId The id of the storage.
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

    /**
     * Find a node (Item or Storage) by its ID.
     * @param storages The array of storages to search within.
     * @param id The ID of the node to find.
     * @returns The found node (Item or Storage), or null if not found.
     */
    findNodeById(storages: Storage[], id: string): Node | null {
      for (const storage of storages) {
        if (storage.id === id) {
          return storage;  // Found a storage node
        }

        for (const item of storage.items) {
          if (item.id === id) {
            return item;  // Found an item node
          }
        }

        // Recursive search in child storages
        const foundInChildren = this.findNodeById(storage.children, id);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
      return null;  // Node not found
    },

    /**
     * Update an existing Storage in the storage tree.
     * If the hierarchy changes, the corresponding `parentId` of the Storage will be updated.
     * @param node The updated storage.
     * @throws Error if the storage with the given id is not found.
     */
    updateNode(node: Node) {
      // Find the storage to update
      const storage = this.findNodeById(this.storage, node.id)
      if (!storage) {
        throw new Error(`Failed to find node with id ${node.id}`)
      }

      // Update the storage's properties
      Object.assign(storage, node)

      // Save the updated storage data
      saveToLocalStorage(this.storage)
    },

    /**
     * Deletes a node (either a Storage or an Item) based on the provided ID.
     * @param nodeId The ID of the node to delete.
     */
    deleteNode(nodeId: string) {
      const deleteNodeRecursively = (id: string, storages: Storage[]): boolean => {
        for (let i = 0; i < storages.length; i++) {
          const storage = storages[i]

          // Check if the current storage matches the ID to delete
          if (storage.id === id) {
            storages.splice(i, 1) // Remove the storage
            return true
          }

          // Check if any item within the current storage matches the ID to delete
          for (let j = 0; j < storage.items.length; j++) {
            if (storage.items[j].id === id) {
              storage.items.splice(j, 1) // Remove the item
              return true
            }
          }

          // Recursive call for child storages
          if (deleteNodeRecursively(id, storage.children)) {
            return true
          }
        }
        return false // Node not found
      }

      // Attempt to delete the node
      if (!deleteNodeRecursively(nodeId, this.storage)) {
        throw new Error(`Failed to delete node with id ${nodeId}`) // Error if node is not found
      }

      // Save the updated data to localStorage
      saveToLocalStorage(this.storage)
    },

    /**
     * Move a node (either a Storage or an Item) to a new parent Storage.
     * @param nodeId The ID of the node to move.
     * @param newParentId The ID of the new parent Storage.
     */
    moveNode(nodeId: string, newParentId: string) {
      const node = this.findNodeById(this.storage, nodeId);
      if (!node) {
        throw new Error(`Failed to find node with id ${nodeId}`);
      }

      if (isDescendant(this.storage, newParentId, nodeId)) {
        throw new Error("Cannot move a node to its descendant");
      }

      const newParent = this.findNodeById(this.storage, newParentId);
      if (!newParent) {
        throw new Error(`Failed to find new parent with id ${newParentId}`);
      }

      const parentStorage = getParentStorage(this.storage, newParentId);
      if (!parentStorage) {
        throw new Error("Failed to find a valid parent node to move to");
      }

      moveNodeToStorage(node, parentStorage, this.deleteNode, this.addStorage, this.addItem);
      saveToLocalStorage(this.storage);
    },
  }
})
