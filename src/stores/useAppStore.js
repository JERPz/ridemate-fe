import { reactive, computed, readonly } from 'vue'
import { authApi, walletApi, ridesApi } from '@/api'
import { getToken, setToken, clearToken, isAuthenticated } from '@/lib/auth'

/**
 * useAppStore
 *
 * App-wide state backed by the API layer (real backend or mock, chosen by
 * VITE_USE_MOCK). Views call the async actions and read from the reactive
 * `state`. No business data is persisted in the browser any more — the backend
 * is the source of truth; only the auth token is stored (see lib/auth.js).
 */

const state = reactive({
  ready: false, // initial session check finished
  loading: false, // a request is in flight
  error: '', // last user-facing error message
  authenticated: isAuthenticated(),
  user: null, // { name, email }
  coinBalance: 0,
  orders: [],
})

/* ---- getters ---- */

const orders = computed(() => state.orders)
const activeOrders = computed(() =>
  state.orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled'),
)
const orderCount = computed(() => state.orders.length)

/* ---- helpers ---- */

function setError(err) {
  state.error = err?.message || 'Something went wrong. Please try again.'
}

function clearError() {
  state.error = ''
}

async function refreshWallet() {
  const { balance } = await walletApi.get()
  state.coinBalance = balance
}

async function refreshOrders() {
  const { rides } = await ridesApi.list()
  state.orders = rides
}

/* ---- actions ---- */

/**
 * Restore the session on app boot: if a token exists, load the profile,
 * wallet and orders. Clears the token if the backend rejects it.
 */
async function bootstrap() {
  if (!getToken()) {
    state.authenticated = false
    state.ready = true
    return
  }
  try {
    const { user } = await authApi.me()
    state.user = user
    state.authenticated = true
    await Promise.all([refreshWallet(), refreshOrders()])
  } catch {
    clearToken()
    state.authenticated = false
    state.user = null
  } finally {
    state.ready = true
  }
}

async function login({ email, password }) {
  clearError()
  state.loading = true
  try {
    const { token, user } = await authApi.login({ email, password })
    setToken(token)
    state.user = user
    state.authenticated = true
    await Promise.all([refreshWallet(), refreshOrders()])
    return true
  } catch (err) {
    setError(err)
    return false
  } finally {
    state.loading = false
  }
}

async function logout() {
  try {
    await authApi.logout()
  } catch {
    /* ignore network errors on logout */
  }
  clearToken()
  state.authenticated = false
  state.user = null
  state.coinBalance = 0
  state.orders = []
}

/** Called by the http layer (via onUnauthorized) when a 401 is received. */
function handleUnauthorized() {
  state.authenticated = false
  state.user = null
}

async function topUp(amount) {
  clearError()
  state.loading = true
  try {
    const { balance } = await walletApi.topUp(amount)
    state.coinBalance = balance
    return true
  } catch (err) {
    setError(err)
    return false
  } finally {
    state.loading = false
  }
}

async function quote({ pickup, dropoff, vehicle }) {
  try {
    return await ridesApi.quote({ pickup, dropoff, vehicle })
  } catch (err) {
    setError(err)
    return { distanceKm: 0, fare: 0 }
  }
}

async function createOrder({ pickup, dropoff, vehicle }) {
  clearError()
  state.loading = true
  try {
    const { ride } = await ridesApi.create({ pickup, dropoff, vehicle })
    state.orders.unshift(ride)
    await refreshWallet()
    return ride
  } catch (err) {
    setError(err)
    return null
  } finally {
    state.loading = false
  }
}

async function updateOrderStatus(id, status) {
  try {
    const { ride } = await ridesApi.updateStatus(id, status)
    const idx = state.orders.findIndex((o) => o.id === id)
    if (idx !== -1) state.orders[idx] = ride
  } catch (err) {
    setError(err)
  }
}

async function cancelOrder(id) {
  try {
    const { ride } = await ridesApi.cancel(id)
    const idx = state.orders.findIndex((o) => o.id === id)
    if (idx !== -1) state.orders[idx] = ride
    await refreshWallet()
  } catch (err) {
    setError(err)
  }
}

export function useAppStore() {
  return {
    state: readonly(state),
    orders,
    activeOrders,
    orderCount,
    bootstrap,
    login,
    logout,
    handleUnauthorized,
    topUp,
    quote,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    clearError,
  }
}
