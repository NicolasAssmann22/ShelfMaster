import { defineStore } from 'pinia'
import type { Category } from '../types/models'
import categoriesData from '../assets/categories-data.json'

/************************* private helper functions *************************/

// save the categories data to localStorage
const saveToLocalStorage = (categories: Category[]) => {
  localStorage.setItem('categoriesData', JSON.stringify(categories))
}

/************************* exposed functions *************************/

export const useCategoryStore = defineStore('category', {
  // Define the initial state
  state: () => ({
    categories: [] as Category[], // The categories array
  }),

  // Define actions
  actions: {
    // Load categories data from JSON or localStorage
    loadCategoriesData() {
      const storedData = localStorage.getItem('categoriesData')
      if (storedData) {
        this.categories = JSON.parse(storedData)
      } else {
        console.log('Loading categories data...')
        this.categories = categoriesData

        saveToLocalStorage(this.categories)
      }
    },

    /**
     * Add a new category.
     * @param name The name of the new category.
     */
    addCategory(name: string) {
      const newCategory: Category = {
        id: `${Date.now()}`, // Generate a unique ID based on the timestamp
        name,
      }
      this.categories.push(newCategory)

      // Save the updated categories in localStorage
      saveToLocalStorage(this.categories)
    },

    /**
     * Remove a category by its ID.
     * @param categoryId The ID of the category to remove.
     */
    removeCategory(categoryId: string) {
      const index = this.categories.findIndex((category) => category.id === categoryId)
      if (index !== -1) {
        this.categories.splice(index, 1)
        // Save the updated categories in localStorage
        saveToLocalStorage(this.categories)
      } else {
        throw new Error(`Category with id ${categoryId} not found.`)
      }
    },
  },
})
