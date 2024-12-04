export interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  parentId?: string | undefined;
}

export interface Storage {
  id: string;
  name: string;
  items: Item[];
  children: Storage[];
}

export interface StorageNode {
  id: string;
  label: string;
  children: StorageNode[];
  items?: Item[];
}
