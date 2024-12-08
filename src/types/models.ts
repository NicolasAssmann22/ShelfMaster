export interface Item {
  id: string;
  parentId?: string | undefined;
  name: string;
  category: string;
  quantity: number;
  status: ItemStatus;
  icon?: string | undefined;
}

export enum ItemStatus {
  Available = 'Available',
  Lent = 'Lent',
}

export interface Storage {
  id: string;
  name: string;
  icon?: string | undefined;
  items: Item[];
  children: Storage[];
}

export interface StorageNode {
  id: string;
  label: string;
  children: StorageNode[];
  items?: Item[];
}
