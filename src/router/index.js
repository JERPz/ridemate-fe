import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import PlaceholderView from '@/views/PlaceholderView.vue'

/**
 * Screens map 1:1 onto frames in the Figma file (XOOPJPlxtNJDxR2F5HQO9y).
 * The routes still pointing at PlaceholderView are the frames that exist in
 * the design but have not been implemented yet.
 */
const routes = [
  { path: '/', name: 'login', component: LoginView, meta: { title: 'Login' } },
  { path: '/home', name: 'home', component: HomeView, meta: { title: 'Home' } },

  // Designed in Figma, not yet built.
  {
    path: '/call-rider',
    name: 'call-rider',
    component: PlaceholderView,
    meta: { title: 'Call Rider' },
  },
  { path: '/for-rider', name: 'for-rider', component: PlaceholderView, meta: { title: 'For Rider' } },
  { path: '/my-order', name: 'my-order', component: PlaceholderView, meta: { title: 'My Order' } },
  { path: '/chat', name: 'chat', component: PlaceholderView, meta: { title: 'Chat' } },
  { path: '/topup', name: 'topup', component: PlaceholderView, meta: { title: 'Top Up' } },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — RIDEMATE` : 'RIDEMATE'
})

export default router
