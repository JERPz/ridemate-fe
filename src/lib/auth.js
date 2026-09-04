/**
 * auth.js
 *
 * Small wrapper around token persistence. The access token is stored in
 * localStorage so the session survives a page refresh. Keeping this in one
 * place means the HTTP client and the store never touch storage keys directly.
 *
 * Note: localStorage is readable by any script on the origin. For a stricter
 * setup, the backend can issue an httpOnly refresh cookie and short-lived
 * access tokens; the client code below would then only hold the access token
 * in memory. The interface here stays the same either way.
 */

const TOKEN_KEY = 'ridemate:token'

let inMemoryToken = null

export function getToken() {
  if (inMemoryToken) return inMemoryToken
  try {
    inMemoryToken = localStorage.getItem(TOKEN_KEY)
  } catch {
    inMemoryToken = null
  }
  return inMemoryToken
}

export function setToken(token) {
  inMemoryToken = token || null
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable — token still held in memory for this session */
  }
}

export function clearToken() {
  setToken(null)
}

export function isAuthenticated() {
  return Boolean(getToken())
}
