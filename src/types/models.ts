import crypto from 'crypto-js';

// Default icons for storage and items
const STORAGE_DEFAULT_ICON = 'FolderIcon'
const ITEM_DEFAULT_ICON = 'WrenchIcon'
const IS_DEBUG = false;

// Interface for categories
export interface Category {
  id: string // Unique identifier for the category
  name: string // Name of the category
  description?: string // Optional desciption of the category
}

// Base interface for tree nodes
export interface Node {
  id: string // Unique identifier for the node
  parentId: string | undefined // ID of the parent node (if any)
  name: string // Name of the node
  icon: string // Icon representing the node
}

// Interface for items within storage
export interface Item extends Node {
  categoryId: string // Category of the item
  quantity: number // Quantity of the item
  status: ItemStatus // Status of the item (Available or Lent)
}

// Enum for item statuses
export enum ItemStatus {
  Available = 'available', // Item is available
  Lent = 'lent', // Item is lent out
}

// Interface for storage that can hold items and other storage
export interface Storage extends Node {
  items: Item[] // Items stored in this storage
  children: Storage[] // Child storages under this storage
  description?: string // Description of the storage
}

// Function to create a new item with validation and defaults
export function createItem(data: Partial<Item> & Pick<Item, 'name'>): Item {
  if (!data.name) {
    throw new Error('Item name is required') // Ensure the name is provided
  }

  return {
    id: data.id ?? generateId(data.name), // Generate or use provided ID
    parentId: data.parentId, // Parent ID if provided
    name: data.name, // Mandatory field
    categoryId: data.categoryId ?? '',
    quantity: data.quantity ?? 1, // Default quantity is 1
    status: data.status ?? ItemStatus.Available, // Default status is Available
    icon: data.icon ?? ITEM_DEFAULT_ICON, // Default icon for items
  }
}

// Function to create a new storage with validation and defaults
export function createStorage(data: Partial<Storage> & Pick<Storage, 'name'>): Storage {
  if (!data.name) {
    throw new Error('Storage name is required') // Ensure the name is provided
  }

  return {
    id: data.id ?? generateId(data.name), // Generate or use provided ID
    parentId: data.parentId, // Parent ID if provided
    name: data.name, // Mandatory field
    icon: data.icon ?? STORAGE_DEFAULT_ICON, // Default icon for storage
    items: data.items ?? [], // Default to an empty list of items
    children: data.children ?? [], // Default to no child storages
    description: data.description, // Optional description field
  }
}

// Function to create a new category with validation and defaults
export function createCategory(data: Partial<Category> & Pick<Category, 'name'>): Category {
  if (!data.name) {
    throw new Error('Category name is required')
  }

  return {
    id: data.id ?? generateId(data.name), // Generate or use provided ID
    name: data.name, // Mandatory field
    description: data.description + '', // Optional description field
  }
}

// Function to generate a unique ID based on name and timestamp
function generateId(name: string): string {
  if (IS_DEBUG) {
    return name;
  }
  console.log("generate id for: " + name);
  const timestamp = Date.now().toString() // Current timestamp
  return crypto.sha256(name + timestamp)
    .toString(crypto.enc.Hex)
    .substring(0, 8) // Hash the name with timestamp
}

// Function to retrieve the default icon for a given node
export function getDefaultIcon(node: Node): string {
  if (isStorage(node)) {
    return STORAGE_DEFAULT_ICON // Return storage default icon for storage nodes
  } else if (isItem(node)) {
    return ITEM_DEFAULT_ICON // Return item default icon for item nodes
  }
  throw Error('Unknown node type') // Error if the node type is unrecognized
}

export function isStorage(node: Node): node is Storage {
  return 'items' in node
}

export function isItem(node: Node): node is Item {
  return 'quantity' in node
}
