# RIDEMATE — Backend & Database Contract

This document is the contract the RIDEMATE frontend expects from the backend.
The frontend is already wired to these endpoints (see `src/api/*`); today it
runs against an in-browser mock (`VITE_USE_MOCK=true`). Set `VITE_USE_MOCK=false`
and point `VITE_API_BASE_URL` at the real server to switch over — no frontend
code changes required.

## Conventions

- Base URL: value of `VITE_API_BASE_URL`, e.g. `https://api.ridemate.app/api`.
- All requests and responses are JSON (`Content-Type: application/json`).
- Auth: the client sends `Authorization: Bearer <token>` on every request once
  logged in. The token is obtained from `/auth/login` or `/auth/register`.
- Currency: "coins" are integers (no fractional coins).
- Timestamps: ISO 8601 UTC strings (e.g. `2026-09-04T09:12:00Z`).
- IDs: strings. The frontend does not assume any particular format.

### Error format

Non-2xx responses should return this shape so the client can surface a message:

```json
{
  "message": "Human readable error.",
  "code": "machine_code",
  "details": { "field": "optional field-level info" }
}
```

The client treats any `401` as "session expired": it clears the token and
redirects to the login screen. Notable codes the UI already understands:
`insufficient_funds` (HTTP 402), `invalid_amount` (400), `unauthenticated` (401).

---

## Endpoints

### Auth

| Method | Path             | Body                          | Response            |
| ------ | ---------------- | ----------------------------- | ------------------- |
| POST   | `/auth/register` | `{ name, email, password }`   | `{ token, user }`   |
| POST   | `/auth/login`    | `{ email, password }`         | `{ token, user }`   |
| POST   | `/auth/logout`   | —                             | `204 No Content`    |
| GET    | `/auth/me`       | —                             | `{ user }`          |

`user`: `{ "id": "u_1", "name": "Jeeraphol", "email": "j@kmitl.ac.th" }`

Passwords must be hashed server-side (bcrypt/argon2). Never return the hash.

### Wallet

| Method | Path                    | Body           | Response                    |
| ------ | ----------------------- | -------------- | --------------------------- |
| GET    | `/wallet`               | —              | `{ balance }`               |
| POST   | `/wallet/topup`         | `{ amount }`   | `{ balance, transaction }`  |
| GET    | `/wallet/transactions`  | —              | `{ transactions: [...] }`   |

`transaction`: `{ "id": "TX123", "type": "topup", "amount": 100, "createdAt": "..." }`
`type` is one of `topup | ride | refund`.

`amount` must be a positive integer; reject otherwise with `400 invalid_amount`.

### Rides

| Method | Path                | Body                          | Response                 |
| ------ | ------------------- | ----------------------------- | ------------------------ |
| GET    | `/rides`            | —                             | `{ rides: [...] }`       |
| POST   | `/rides/quote`      | `{ pickup, dropoff, vehicle }`| `{ distanceKm, fare }`   |
| POST   | `/rides`            | `{ pickup, dropoff, vehicle }`| `{ ride }`               |
| PATCH  | `/rides/:id`        | `{ status }`                  | `{ ride }`               |
| POST   | `/rides/:id/cancel` | —                             | `{ ride }`               |

`vehicle` is one of `bike | car`.

`ride`:

```json
{
  "id": "RM123456",
  "pickup": "Main gate",
  "dropoff": "Library",
  "vehicle": "Bike",
  "distanceKm": 4,
  "fare": 42,
  "status": "searching",
  "createdAt": "2026-09-04T09:12:00Z"
}
```

`status` lifecycle: `searching -> ongoing -> completed`, or `cancelled`.

Fare rules the mock uses (backend is free to replace with real routing/pricing):
`fare = base + rate * distanceKm`, where bike = `{ base: 10, rate: 8 }`,
car = `{ base: 20, rate: 14 }`.

Business rules the frontend relies on:
- `POST /rides` must atomically check the balance, debit the fare, and create
  the ride. If the balance is too low, return `402 insufficient_funds` and do
  not create the ride.
- `POST /rides/:id/cancel` refunds the fare if the ride is not already
  `completed`/`cancelled`, and sets status to `cancelled`.

### Chat (support)

| Method | Path             | Body        | Response              |
| ------ | ---------------- | ----------- | --------------------- |
| GET    | `/chat/messages` | —           | `{ messages: [...] }` |
| POST   | `/chat/messages` | `{ text }`  | `{ message }`         |

`message`: `{ "id": "m_1", "from": "me" | "agent", "text": "..." }`
(`from` is relative to the requesting user.)

---

## Database schema (reference)

A relational schema that satisfies the contract. Types are Postgres-flavoured;
adapt as needed. All money columns are integer coins.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One wallet per user. Balance is the source of truth for coins.
CREATE TABLE wallets (
  user_id  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance  INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0)
);

CREATE TABLE transactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('topup','ride','refund')),
  amount     INTEGER NOT NULL,          -- positive credit, negative debit
  ride_id    UUID REFERENCES rides(id), -- set for ride/refund rows
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rides (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pickup      TEXT NOT NULL,
  dropoff     TEXT NOT NULL,
  vehicle     TEXT NOT NULL CHECK (vehicle IN ('bike','car')),
  distance_km INTEGER NOT NULL,
  fare        INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'searching'
                CHECK (status IN ('searching','ongoing','completed','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender     TEXT NOT NULL CHECK (sender IN ('user','agent')),
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rides_user_created ON rides(user_id, created_at DESC);
CREATE INDEX idx_tx_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_chat_user_created ON chat_messages(user_id, created_at);
```

Notes:
- Booking a ride and topping up must run in a transaction that updates both
  `wallets.balance` and inserts a `transactions` row, so the ledger always
  reconciles with the balance.
- Map `chat_messages.sender` (`user`/`agent`) to the API's `from`
  (`me`/`agent`) relative to the requester.

---

## Local development

- Mock backend (default): `VITE_USE_MOCK=true` — no server needed, data lives in
  the browser's localStorage. Great for UI work and demos.
- Real backend: set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL` to the server.
  Ensure the server enables CORS for the frontend origin and accepts the
  `Authorization` header.

The frontend never imports the mock unless the flag is on, so it is safe to keep
in the bundle during early integration and drop later if desired.
