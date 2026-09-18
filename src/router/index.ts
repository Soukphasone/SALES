import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard/Dashboard.vue'
import AdminManager from '@/components/Admin/AdminManager.vue'
const routes = [
  {
    path: '/',
    redirect: '/all' // 👈 เพิ่มบรรทัดนี้เพื่อให้วิ่งไปที่ /all อัตโนมัติ
  },
  {
    path: '/:type(car|land|all)',
    name: 'TypePage',
    component: Dashboard,
    meta: { title: 'Sales Dashboard' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminManager,
    meta: { title: 'Admin' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/all' // 👈 Redirect route ที่ไม่มีอยู่จริงกลับไป /all
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
