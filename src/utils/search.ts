import type { Node, Storage, Item } from '../types/models';

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
      if ('items' in node && 'children' in node) {
        const storageNode: Storage = node as Storage;
        search(storageNode.items, newPath);
        search(storageNode.children, newPath);
      }
    }
  };

  search(nodes, currentPath);
  return result;
};

/**
 * Search for nodes in the storage tree that match the given search text.
 * @param searchText The text to search for.
 * @param storages The storage tree to search in.
 * @returns An array of matching nodes.
 */
export const searchNodesByName = (searchText: string, storages: Storage[]): SearchResult[] => {
  return searchRecursively(storages, (node) => searchText.length > 0 && node.name.includes(searchText));
};

/**
 * Search for items in the storage tree that match the given category.
 * @param categoryId The category to search for.
 * @param storages The storage tree to search in.
 * @returns An array of matching items.
 */
export const searchItemsByCategory = (categoryId: string, storages: Storage[]): SearchResult[] => {
  return searchRecursively(storages, (node) => 'categoryId' in node && node.categoryId === categoryId);
};

export const filterTreeByCategory = (categoryId: string, storages: Storage[]): Storage[] => {
  const filterRecursively = (storage: Storage): boolean => {
    const items = searchItemsByCategory(categoryId, [storage]);
    if (items.length > 0) {
      return true;
    }
    return storage.children.some(filterRecursively);
  };

  return storages.filter(filterRecursively);
};
