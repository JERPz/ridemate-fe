import { getToken, clearToken } from '@/lib/auth'

/**
 * http.js
 *
 * Thin fetch wrapper shared by every API service module. It:
 *   - prefixes requests with VITE_API_BASE_URL
 *   - serialises JSON bodies and parses JSON responses
 *   - attaches the bearer token when the user is signed in
 *   - enforces a request timeout
 *   - normalises errors into a single ApiError shape
 *   - clears the session on 401 so the app can redirect to login
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 15000

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'unknown', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Callbacks the app can register to react to global auth events (e.g. a 401
 * forcing a logout + redirect). Keeps http.js decoupled from the router/store.
 */
const listeners = { unauthorized: [] }

export function onUnauthorized(fn) {
  listeners.unauthorized.push(fn)
}

function emitUnauthorized() {
  listeners.unauthorized.forEach((fn) => {
    try {
      fn()
    } catch {
      /* ignore listener errors */
    }
  })
}

async function request(method, path, { body, headers = {}, signal } = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

  // Allow a caller-provided signal to also abort the request.
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true })

  const token = getToken()
  const finalHeaders = { Accept: 'application/json', ...headers }
  if (token) finalHeaders.Authorization = `Bearer ${token}`

  let init = { method, headers: finalHeaders, signal: controller.signal }
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(url, init)
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new ApiError('The request timed out. Check your connection and try again.', {
        code: 'timeout',
      })
    }
    throw new ApiError('Network error. Please check your connection.', { code: 'network' })
  }
  clearTimeout(timeoutId)

  // Parse the body if there is one.
  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearToken()
      emitUnauthorized()
    }
    const message =
      (data && (data.message || data.error)) || `Request failed with status ${res.status}`
    throw new ApiError(message, {
      status: res.status,
      code: (data && data.code) || 'http_error',
      details: data && data.details,
    })
  }

  return data
}

export const http = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
}
