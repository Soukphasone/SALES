import { createRouter, createWebHistory } from 'vue-router'
import ECommerceView from '@/views/Dashboard/ECommerceView.vue'
import DetailView from '@/views/Dashboard/Detail.vue'
import AdminManager from '@/components/Admin/AdminManager.vue'

const routes = [
  {
    path: '/:type(car|land|all)',
    name: 'TypePage',
    component: ECommerceView,
    meta: {
      title: 'Sales Dashboard'
    }
  },
  {
    path: '/detail',
    name: 'detail',
    component: DetailView,
    meta: {
      title: 'Detail'
    }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminManager,
    meta: {
      title: 'Admin'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  document.title = `BO SALES`
  next()
})

export default router
