import CryptoJS from 'crypto-js';

const STORAGE_DEFAULT_ICON = 'FolderIcon';
const ITEM_DEFAULT_ICON = 'WrenchIcon';

export interface Node {
  id: string;
  name: string;
  icon: string;
}

export interface Item extends Node {
  parentId?: string | undefined;
  category?: string;
  quantity: number;
  status: ItemStatus;
}

export enum ItemStatus {
  Available = 'Available',
  Lent = 'Lent',
}

export interface Storage extends Node {
  items: Item[];
  children: Storage[];
}

export function createItem(data: Omit<Item, 'name'> & Partial<Item>): Item {
  if (!data.name) {
    throw new Error('Item name is required');
  }

  return {
    id: data.id ?? generateId(data.name),
    name: data.name,
    category: data.category?.toLowerCase().trim(),
    quantity: data.quantity ?? 1,
    status: data.status ?? ItemStatus.Available,
    icon: data.icon ?? ITEM_DEFAULT_ICON,
  };
}

function generateId(name: string): string {
  return CryptoJS.SHA256(name).toString(CryptoJS.enc.Hex);
}

export function createStorage(data: Omit<Storage, 'name'> & Partial<Storage>): Storage {
  if (!data.name) {
    throw new Error('Storage name is required');
  }

  return {
    id: data.id ?? generateId(data.name),
    name: data.name,
    icon: data.icon ?? STORAGE_DEFAULT_ICON,
    items: data.items ?? [],
    children: data.children ?? []
  };
}

export function getDefaultIcon(node: Node): string {
  if ('items' in node) {
    return STORAGE_DEFAULT_ICON;
  } else if ('quantity' in node) {
    return ITEM_DEFAULT_ICON;
  }
  throw Error('Unknown node type');
}
