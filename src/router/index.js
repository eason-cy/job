import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/applications',
    name: 'ApplicationList',
    component: () => import('../views/ApplicationList.vue')
  },
  {
    path: '/algorithms',
    name: 'AlgorithmList',
    component: () => import('../views/AlgorithmList.vue')
  },
  {
    path: '/bagus',
    name: 'BaguList',
    component: () => import('../views/BaguList.vue')
  },
  {
    path: '/interview-records',
    name: 'InterviewRecords',
    component: () => import('../views/InterviewRecords.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
