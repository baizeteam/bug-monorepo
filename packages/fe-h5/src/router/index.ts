import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { guest: true } },
    { path: '/register', name: 'Register', component: () => import('../views/Register.vue'), meta: { guest: true } },
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      meta: { auth: true },
      children: [
        { path: '', name: 'BugList', component: () => import('../views/BugList.vue') },
        { path: 'create', name: 'CreateBug', component: () => import('../views/CreateBug.vue') },
        { path: 'bug/:id', name: 'BugDetail', component: () => import('../views/BugDetail.vue') },
        { path: 'orders', name: 'MyOrders', component: () => import('../views/MyOrders.vue') },
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
  if (to.meta.guest && auth.isLoggedIn) {
    const redirect = (to.query.redirect as string) || '/'
    next(redirect)
    return
  }
  next()
})

export default router
