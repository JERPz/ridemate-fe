import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { onUnauthorized } from '@/lib/http'
import { useAppStore } from '@/stores/useAppStore'

const app = createApp(App)
app.use(router)

const store = useAppStore()

// When any request gets a 401, drop the session and send the user to login.
onUnauthorized(() => {
  store.handleUnauthorized()
  router.replace({ name: 'login' })
})

// Restore any existing session before the first paint of guarded routes.
store.bootstrap()

app.mount('#app')
