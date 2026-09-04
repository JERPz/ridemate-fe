import { http } from '@/lib/http'

/**
 * Wallet API.
 *
 * Endpoints:
 *   GET  /wallet              -> { balance }
 *   POST /wallet/topup        { amount } -> { balance, transaction }
 *   GET  /wallet/transactions -> { transactions: [...] }
 */
export const walletApi = {
  get: () => http.get('/wallet'),
  topUp: (amount) => http.post('/wallet/topup', { amount }),
  transactions: () => http.get('/wallet/transactions'),
}
