import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ApplicationList from '../views/ApplicationList.vue'
import AlgorithmList from '../views/AlgorithmList.vue'
import BaguList from '../views/BaguList.vue'
import InterviewRecords from '../views/InterviewRecords.vue'

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
  },
  {
    path: '/algorithms',
    name: 'AlgorithmList',
    component: AlgorithmList
  },
  {
    path: '/bagus',
    name: 'BaguList',
    component: BaguList
  },
  {
    path: '/interview-records',
    name: 'InterviewRecords',
    component: InterviewRecords
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router