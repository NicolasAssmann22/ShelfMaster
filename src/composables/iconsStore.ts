// src/stores/iconsStore.ts
import { defineStore } from 'pinia'

export const useIconsStore = defineStore('icons', {
  state: () => ({
    iconOptions: [
      'FolderIcon',
      'WrenchIcon',
      'GiftIcon',
      'IdentificationIcon',
      'HomeIcon',
      'KeyIcon',
      'RadioIcon',
      'ScissorsIcon',
    ],
  }),
  actions: {},
})
