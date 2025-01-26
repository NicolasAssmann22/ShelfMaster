import type { Node, Storage, Item, Category } from '../types/models'
import { isStorage, isItem } from '../types/models'

export interface SearchResult {
  node: Node;
  path: Node[];
}

/**
 * Helper method to search nodes recursively and store the path for each matching node.
 * @param nodes The nodes to search in.
 * @param matchCallback The callback function to determine if a node matches the search criteria.
 * @param currentPath The current path being traversed.
 * @returns An array of objects containing the matching nodes and their paths.
 */
const searchRecursively = (nodes: Node[], matchCallback: (node: Node) => boolean, currentPath: Node[] = []): SearchResult[] => {
  const result: SearchResult[] = [];

  const search = (nodes: Node[], path: Node[]) => {
    for (const node of nodes) {
      const newPath = [...path, node];
      if (matchCallback(node)) {
        result.push({ node, path: newPath });
      }
      if (isStorage(node)) {
        const storageNode: Storage = node as Storage;
        search(storageNode.items, newPath);
        search(storageNode.children, newPath);
      }
    }
  };

  search(nodes, currentPath);
  return result;
};


const createTreeFromSearchResults = (results: SearchResult[]): Storage[] => {
  const tree: Storage[] = [];

  results.forEach((result) => {
    const path = result.path;
    let currentStorage: Storage | undefined = undefined;

    path.forEach((node) => {
      if (isStorage(node)) {
        const storage = node as Storage;
        if (!currentStorage) {
          let existingStorage = tree.find((n) => n.id === storage.id);
          if (!existingStorage) {
            existingStorage = { ...storage, children: [], items: [] };
            tree.push(existingStorage);
          }
          currentStorage = existingStorage;
        } else {
          let nextStorage = currentStorage.children.find((n) => n.id === storage.id);
          if (!nextStorage) {
            nextStorage = { ...storage, children: [], items: [] };
            currentStorage.children.push(nextStorage);
          }
          currentStorage = nextStorage;
        }
      } else {
        const item = node as Item;
        if (currentStorage) {
          currentStorage.items.push(item);
        }
      }
    });
  });

  return tree;
}

/**
 * Search for nodes in the storage tree that match the given search text.
 * @param searchText The text to search for.
 * @param storages The storage tree to search in.
 * @returns An array of matching nodes.
 */
export const searchNodesByName = (searchText: string, storages: Storage[]): SearchResult[] => {
  return searchRecursively(storages, (node) => searchText.length > 0 && node.name.toLowerCase().includes(searchText.toLowerCase()));
};

/**
 * Search for items in the storage tree that match the given category.
 * @param categoryName The category to search for.
 * @param storages The storage tree to search in.
 * @param categories The list of categories to match against.
 * @returns An array of matching items.
 */
export const searchItemsByCategoryName = (categoryName: string, storages: Storage[], categories: Category[]): SearchResult[] => {
  const matchingCategories = categories.filter((c) => c.name.toLowerCase().includes(categoryName.toLowerCase()));
  return searchRecursively(storages, (node) => {
    if (isItem(node)) {
      const item = node as Item;
      return matchingCategories.some((c) => c.id === item.categoryId);
    }
    return false;
  });
};

export const searchItemsByCategoryId = (categoryId: string, storages: Storage[]): SearchResult[] => {
  return searchRecursively(storages, (node) => {
    if (isItem(node)) {
      const item = node as Item;
      return item.categoryId === categoryId;
    }
    return false;
  });
}

/**
 * Filter the storage tree the given category id.
 * @param categoryId The category to filter by.
 * @param storages The storage tree to filter.
 * @returns A new storage tree containing only the matching nodes.
 */
export const filterTreeByCategory = (categoryId: string, storages: Storage[]): Storage[] => {
  const results = searchItemsByCategoryId(categoryId, storages);
  return createTreeFromSearchResults(results);
};
