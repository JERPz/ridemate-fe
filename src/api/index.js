import { authApi as realAuth } from '@/api/auth'
import { walletApi as realWallet } from '@/api/wallet'
import { ridesApi as realRides } from '@/api/rides'
import { chatApi as realChat } from '@/api/chat'
import { mock } from '@/api/mock'

/**
 * api/index.js
 *
 * Single entry point for all API access. When VITE_USE_MOCK is "true" the
 * in-browser mock adapter is used; otherwise requests go to the real backend
 * over HTTP. The store and views import from here and never need to know which
 * is active, so switching is a one-line env change.
 */

export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK).toLowerCase() === 'true'

export const authApi = USE_MOCK ? mock.authApi : realAuth
export const walletApi = USE_MOCK ? mock.walletApi : realWallet
export const ridesApi = USE_MOCK ? mock.ridesApi : realRides
export const chatApi = USE_MOCK ? mock.chatApi : realChat

export { ApiError } from '@/lib/http'
