import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { UserRole } from '@bug/shared'

/** 导航配置：path, name, label, roles 可访问的角色 */
export const navConfig = [
  { path: '/', name: 'OrderList', label: '订单列表', roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { path: '/users', name: 'UserList', label: '用户管理', roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { path: '/admin', name: 'Admin', label: '时效监控', roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { path: '/logs', name: 'LogList', label: '操作日志', roles: [UserRole.SUPER_ADMIN] },
] as const

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { guest: true } },
    { path: '/register', name: 'Register', component: () => import('../views/Register.vue'), meta: { guest: true } },
    { path: '/forbidden', name: 'Forbidden', component: () => import('../views/Forbidden.vue') },
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      meta: { auth: true, admin: true },
      children: [
        { path: '', name: 'OrderList', component: () => import('../views/OrderList.vue'), meta: { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
        { path: 'users', name: 'UserList', component: () => import('../views/UserList.vue'), meta: { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
        { path: 'admin', name: 'Admin', component: () => import('../views/Admin.vue'), meta: { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
        { path: 'logs', name: 'LogList', component: () => import('../views/LogList.vue'), meta: { roles: [UserRole.SUPER_ADMIN] } },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.auth && !auth.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }
  if (to.meta.admin && !auth.isAdmin) {
    next({ name: 'Forbidden' })
    return
  }
  const routeRoles = to.meta.roles as number[] | undefined
  if (routeRoles && auth.user && !routeRoles.includes(auth.user.role)) {
    next({ name: 'Forbidden' })
    return
  }
  if (to.meta.guest && auth.isLoggedIn) {
    if (auth.isAdmin) {
      const redirect = (to.query.redirect as string) || '/'
      next(redirect)
    } else {
      next({ name: 'Forbidden' })
    }
    return
  }
  next()
})

export default router
