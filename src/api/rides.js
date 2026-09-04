import { http } from '@/lib/http'

/**
 * Rides API.
 *
 * Endpoints:
 *   GET   /rides                 -> { rides: [...] }
 *   POST  /rides/quote           { pickup, dropoff, vehicle } -> { distanceKm, fare }
 *   POST  /rides                 { pickup, dropoff, vehicle } -> { ride }
 *   PATCH /rides/:id             { status } -> { ride }
 *   POST  /rides/:id/cancel      -> { ride }
 */
export const ridesApi = {
  list: () => http.get('/rides'),
  quote: (payload) => http.post('/rides/quote', payload),
  create: (payload) => http.post('/rides', payload),
  updateStatus: (id, status) => http.patch(`/rides/${id}`, { status }),
  cancel: (id) => http.post(`/rides/${id}/cancel`),
}
