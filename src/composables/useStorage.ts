import { reactive } from 'vue';
import type { Storage, Item } from '../types/models';
import { ItemStatus } from '../types/models'

const state = reactive({
  storageUnits: [] as Storage[],
});

const useHomeLayout = () => {
  // Helper function to find a storage unit by its ID, accessible by other methods
  const findStorageUnitById = (id: string, units: Storage[]): Storage | null => {
    for (const unit of units) {
      if (unit.id === id) {
        return unit;
      }
      const found = findStorageUnitById(id, unit.children); // Recursive search
      if (found) {
        return found;
      }
    }
    return null;
  };

  const findItemById = (id: string, units: Storage[]): Item | null => {
    for (const unit of units) {
      for (const item of unit.items) {
        if (item.id === id) {
          return item;
        }
      }
      const found = findItemById(id, unit.children); // Recursive search
      if (found) {
        return found;
      }
    }
    return null;
  }

  return {
    state,

    // Add a new storage unit (arbitrary level in the hierarchy)
    addStorageUnit(parentId: string | null, unit: Storage) {
      if (parentId === null) {
        state.storageUnits.push(unit); // Add to root level if no parent
      } else {
        const parent = findStorageUnitById(parentId, state.storageUnits);
        if (parent) {
          parent.children.push(unit); // Add as child of another storage unit
        }
      }
    },

    removeStorageUnit(id: string) {
      const removeUnit = (id: string, units: Storage[]): boolean => {
        for (let i = 0; i < units.length; i++) {
          if (units[i].id === id) {
            units.splice(i, 1);
            return true;
          }
          if (removeUnit(id, units[i].children)) {
            return true;
          }
        }
        return false;
      };
      removeUnit(id, state.storageUnits);
    },

    // Add an item to a storage unit (any level)
    addItem(item: Item, parentId: string) {
      item.parentId = parentId;
      // TODO handle case where storage unit is not found
      findStorageUnitById(parentId, state.storageUnits)?.items.push(item);
    },

    removeItem(itemId: string) {
      const item = findItemById(itemId, state.storageUnits);
      if (!item) {
        throw new Error(`Failed to remove item with id ${itemId}`);
      }

      const parent = findStorageUnitById(item.parentId!, state.storageUnits);
      if (parent) {
        const index = parent.items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          parent.items.splice(index, 1);
        }
      }
    },

    addExampleData() {
      state.storageUnits = [
        {
          id: '1',
          name: 'Kitchen',
          items: [
            { id: '1', name: 'Knife', category: 'Cutlery', quantity: 2, status: ItemStatus.Available },
            { id: '2', name: 'Fork', category: 'Cutlery', quantity: 4, status: ItemStatus.Lent},
          ],
          children: [
            {
              id: '2',
              name: 'Cupboard',
              items: [
                { id: '3', name: 'Plate', category: 'Dinnerware', quantity: 6, status: ItemStatus.Available },
                { id: '4', name: 'Bowl', category: 'Dinnerware', quantity: 3, status: ItemStatus.Available },
              ],
              children: [],
            },
            {
              id: '3',
              name: 'Drawer',
              items: [
                { id: '5', name:'Spoon', category: 'Cutlery', quantity: 3, status: ItemStatus.Available },
                { id: '6', name: 'Teaspoon', category: 'Cutlery', quantity: 5, status: ItemStatus.Lent },
              ],
              children: [],
            },
          ],
        },
        {
          id: '4',
          name: 'Bathroom',
          items: [
            { id: '7', name: 'Toothbrush', category: 'Toiletries', quantity: 2, status: ItemStatus.Available },
            { id: '8', name: 'Toothpaste', category: 'Toiletries', quantity: 1, status: ItemStatus.Available },
          ],
          children: [
            {
              id: '5',
              name: 'Cabinet',
              items: [
                { id: '9', name: 'Towel', category: 'Linen', quantity: 4, status: ItemStatus.Available },
                { id: '10', name: 'Soap', category: 'Toiletries', quantity: 2, status: ItemStatus.Lent },
              ],
              children: [],
            },
          ],
        },
      ];
    }
  }
};

export default useHomeLayout;

