import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '../views/SearchView.vue'
import EditView from '../views/EditView.vue'
import AddCategoryView from '../views/AddCategoryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: SearchView,
    },
    {
      path: '/add',
      name: 'add',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AddView.vue'),
    },
    {
      path: '/edit',
      name: 'edit',
      component: EditView,
    },
    {
      path: '/add-category',
      name: 'add-category',
      component: AddCategoryView,
    },
  ],
})

export default router
