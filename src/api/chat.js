import { http } from '@/lib/http'

/**
 * Chat (support) API.
 *
 * Endpoints:
 *   GET  /chat/messages           -> { messages: [...] }
 *   POST /chat/messages { text }  -> { message }
 */
export const chatApi = {
  messages: () => http.get('/chat/messages'),
  send: (text) => http.post('/chat/messages', { text }),
}
