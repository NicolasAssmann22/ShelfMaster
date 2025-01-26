import './assets/main.css'
import { useCategoryStore } from './composables/categoryStorage'
import { useStorageStore } from './composables/useStorage'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { createPinia } from 'pinia';

const app = createApp(App)
const pinia = createPinia();
app.use(pinia);
app.use(router)

const categoryStore = useCategoryStore();
const storageStore = useStorageStore();

app.mount('#app')

categoryStore.loadCategoriesData();
storageStore.loadStorageData();
