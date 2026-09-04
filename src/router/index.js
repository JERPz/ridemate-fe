import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import PlaceholderView from '@/views/PlaceholderView.vue'
import { isAuthenticated } from '@/lib/auth'

/**
 * Screens map 1:1 onto frames in the Figma file (XOOPJPlxtNJDxR2F5HQO9y).
 * Built screens are lazy-loaded; the routes still pointing at PlaceholderView
 * are frames that exist in the design but have not been implemented yet.
 *
 * `meta.public` marks routes reachable without a session (login/sign-up).
 * Everything else requires authentication — see the guard below.
 */
const routes = [
  { path: '/', name: 'login', component: LoginView, meta: { title: 'Login', public: true } },
  { path: '/home', name: 'home', component: HomeView, meta: { title: 'Home' } },

  {
    path: '/call-rider',
    name: 'call-rider',
    component: () => import('@/views/CallRiderView.vue'),
    meta: { title: 'Call Rider' },
  },
  {
    path: '/my-order',
    name: 'my-order',
    component: () => import('@/views/MyOrderView.vue'),
    meta: { title: 'My Order' },
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/ChatView.vue'),
    meta: { title: 'Chat' },
  },
  {
    path: '/topup',
    name: 'topup',
    component: () => import('@/views/TopUpView.vue'),
    meta: { title: 'Top Up' },
  },

  // Designed in Figma, not yet built.
  { path: '/for-rider', name: 'for-rider', component: PlaceholderView, meta: { title: 'For Rider' } },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Redirect unauthenticated users to login; keep signed-in users off the login
// page. Auth is determined by the presence of a token (see lib/auth.js).
router.beforeEach((to) => {
  const authed = isAuthenticated()
  if (!to.meta.public && !authed) {
    return { name: 'login' }
  }
  if (to.name === 'login' && authed) {
    return { name: 'home' }
  }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — RIDEMATE` : 'RIDEMATE'
})

export default router
