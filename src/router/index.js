import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ApplicationList from '../views/ApplicationList.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/applications',
    name: 'ApplicationList',
    component: ApplicationList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router