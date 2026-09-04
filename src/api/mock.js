import { ApiError } from '@/lib/http'

/**
 * mock.js
 *
 * An in-browser stand-in for the backend, used when VITE_USE_MOCK=true. It
 * mirrors the exact shapes of the real API service modules so the store and
 * views don't care which one is active. State is persisted to localStorage so
 * a refresh keeps balances and orders, just like a real backend would.
 *
 * This lets the whole app be developed and demoed before the backend exists,
 * and deleted (or toggled off) with a single env flag once it does.
 */

const DB_KEY = 'ridemate:mockdb:v1'
const MOCK_TOKEN = 'mock-token'

const seed = () => ({
  users: {
    // email -> record. Password check is intentionally lax in the mock.
  },
  session: null, // email of the signed-in user
  wallets: {}, // email -> balance
  rides: {}, // email -> [ride]
  transactions: {}, // email -> [tx]
  messages: {}, // email -> [message]
})

function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    return raw ? { ...seed(), ...JSON.parse(raw) } : seed()
  } catch {
    return seed()
  }
}

let db = loadDb()

function saveDb() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    /* ignore */
  }
}

// Simulate network latency so loading states are visible during development.
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

function currentEmail() {
  if (!db.session) throw new ApiError('Not authenticated.', { status: 401, code: 'unauthenticated' })
  return db.session
}

const VEHICLES = {
  bike: { base: 10, rate: 8, label: 'Bike' },
  car: { base: 20, rate: 14, label: 'Car' },
}

function pseudoDistance(pickup, dropoff) {
  const seedN = (pickup.length + dropoff.length * 3) % 12
  return Math.max(1, seedN + 1)
}

function ensureUserBuckets(email) {
  if (!db.wallets[email]) db.wallets[email] = 0
  if (!db.rides[email]) db.rides[email] = []
  if (!db.transactions[email]) db.transactions[email] = []
  if (!db.messages[email]) {
    db.messages[email] = [
      { id: 1, from: 'agent', text: 'Hi! 👋 This is RIDEMATE support. How can we help?' },
    ]
  }
}

/* ---------- auth ---------- */

const authApi = {
  async login({ email, password }) {
    await delay()
    if (!email || !password) {
      throw new ApiError('Email and password are required.', { status: 400, code: 'invalid' })
    }
    const name = email.split('@')[0]
    db.users[email] = db.users[email] || { name, email }
    db.session = email
    ensureUserBuckets(email)
    saveDb()
    return { token: MOCK_TOKEN, user: db.users[email] }
  },

  async register({ name, email, password }) {
    await delay()
    if (!email || !password) {
      throw new ApiError('Email and password are required.', { status: 400, code: 'invalid' })
    }
    db.users[email] = { name: name || email.split('@')[0], email }
    db.session = email
    ensureUserBuckets(email)
    saveDb()
    return { token: MOCK_TOKEN, user: db.users[email] }
  },

  async logout() {
    await delay(100)
    db.session = null
    saveDb()
    return null
  },

  async me() {
    await delay(100)
    const email = currentEmail()
    return { user: db.users[email] }
  },
}

/* ---------- wallet ---------- */

const walletApi = {
  async get() {
    await delay(150)
    const email = currentEmail()
    return { balance: db.wallets[email] || 0 }
  },

  async topUp(amount) {
    await delay()
    const email = currentEmail()
    const value = Math.round(Number(amount))
    if (!Number.isFinite(value) || value <= 0) {
      throw new ApiError('Enter a valid amount.', { status: 400, code: 'invalid_amount' })
    }
    db.wallets[email] = (db.wallets[email] || 0) + value
    const transaction = {
      id: `TX${Date.now().toString().slice(-6)}`,
      type: 'topup',
      amount: value,
      createdAt: new Date().toISOString(),
    }
    db.transactions[email].unshift(transaction)
    saveDb()
    return { balance: db.wallets[email], transaction }
  },

  async transactions() {
    await delay(150)
    const email = currentEmail()
    return { transactions: db.transactions[email] || [] }
  },
}

/* ---------- rides ---------- */

const ridesApi = {
  async list() {
    await delay(150)
    const email = currentEmail()
    return { rides: db.rides[email] || [] }
  },

  async quote({ pickup, dropoff, vehicle }) {
    await delay(200)
    const v = VEHICLES[vehicle] || VEHICLES.bike
    const distanceKm = pickup && dropoff ? pseudoDistance(pickup, dropoff) : 0
    const fare = distanceKm ? Math.round(v.base + v.rate * distanceKm) : 0
    return { distanceKm, fare }
  },

  async create({ pickup, dropoff, vehicle }) {
    await delay()
    const email = currentEmail()
    const v = VEHICLES[vehicle] || VEHICLES.bike
    const distanceKm = pseudoDistance(pickup, dropoff)
    const fare = Math.round(v.base + v.rate * distanceKm)

    if (fare > (db.wallets[email] || 0)) {
      throw new ApiError('Insufficient balance for this ride.', {
        status: 402,
        code: 'insufficient_funds',
      })
    }

    const ride = {
      id: `RM${Date.now().toString().slice(-6)}`,
      pickup,
      dropoff,
      vehicle: v.label,
      distanceKm,
      fare,
      status: 'searching',
      createdAt: new Date().toISOString(),
    }
    db.rides[email].unshift(ride)
    db.wallets[email] -= fare
    saveDb()
    return { ride }
  },

  async updateStatus(id, status) {
    await delay(150)
    const email = currentEmail()
    const ride = (db.rides[email] || []).find((r) => r.id === id)
    if (!ride) throw new ApiError('Ride not found.', { status: 404, code: 'not_found' })
    ride.status = status
    saveDb()
    return { ride }
  },

  async cancel(id) {
    await delay(150)
    const email = currentEmail()
    const ride = (db.rides[email] || []).find((r) => r.id === id)
    if (!ride) throw new ApiError('Ride not found.', { status: 404, code: 'not_found' })
    if (ride.status !== 'completed' && ride.status !== 'cancelled') {
      db.wallets[email] += ride.fare // refund
      ride.status = 'cancelled'
    }
    saveDb()
    return { ride }
  },
}

/* ---------- chat ---------- */

const chatApi = {
  async messages() {
    await delay(150)
    const email = currentEmail()
    return { messages: db.messages[email] || [] }
  },

  async send(text) {
    await delay(150)
    const email = currentEmail()
    const list = db.messages[email]
    const message = { id: Date.now(), from: 'me', text }
    list.push(message)
    // Canned agent reply.
    list.push({
      id: Date.now() + 1,
      from: 'agent',
      text: 'Thanks for reaching out — a team member will follow up shortly.',
    })
    saveDb()
    return { message }
  },
}

export const mock = { authApi, walletApi, ridesApi, chatApi }
