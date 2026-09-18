import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  {
    path: '/',
    redirect: '/all'
  },
  {
    path: '/:type(car|land|all)',
    name: 'TypePage',
    component: () => import('@/views/Dashboard/Dashboard.vue'),
    meta: { title: 'Sales Dashboard' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/components/Admin/AdminManager.vue'),
    meta: { title: 'Admin' }
  },
  {
    // ถ้าพิมพ์ URL ผิดให้ Redirect กลับไปที่ /all ป้องกันหน้าขาว
    path: '/:pathMatch(.*)*',
    redirect: '/all'
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
