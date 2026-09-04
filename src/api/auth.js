import { http } from '@/lib/http'

/**
 * Auth API.
 *
 * Endpoints:
 *   POST /auth/login    { email, password } -> { token, user }
 *   POST /auth/register { name, email, password } -> { token, user }
 *   POST /auth/logout   -> 204
 *   GET  /auth/me       -> { user }
 */
export const authApi = {
  login: (credentials) => http.post('/auth/login', credentials),
  register: (payload) => http.post('/auth/register', payload),
  logout: () => http.post('/auth/logout'),
  me: () => http.get('/auth/me'),
}
