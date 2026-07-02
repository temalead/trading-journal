# API Reference

Base backend URL in local development: `http://localhost:8080`.

Frontend calls `/api/*` through Vite. The proxy in `frontend/vite.config.ts` rewrites `/api/deal` to backend `/deal`, `/api/auth/login` to `/auth/login`, etc.

## Auth

Auth endpoints are public.

### `POST /auth/register`

Creates a user and default account, returns an auth session.

Request:

```json
{
  "username": "Tema",
  "email": "tema@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "userId": "uuid",
  "accountId": "uuid",
  "username": "Tema",
  "email": "tema@example.com",
  "roles": ["USER"],
  "accessToken": "jwt",
  "tokenType": "Bearer",
  "expiresInSeconds": 86400
}
```

Notes:

- Email is normalized to lowercase.
- Password must be at least 6 characters.
- Default user role is `USER`.

### `POST /auth/login`

Authenticates an existing user.

Request:

```json
{
  "email": "tema@example.com",
  "password": "secret123"
}
```

Response: same shape as register response.

### `POST /auth/logout`

Returns `204 No Content`.

Current behavior is stateless: frontend logout clears local storage; backend does not revoke JWTs.

## Authenticated Requests

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

Security currently allows `USER` and `ADMIN` for:

- `/deal/**`
- `/pair/**`
- `/accounts/**`
- `/api/deal/**`
- `/api/pair/**`
- `/api/accounts/**`

## Deals

Frontend wrapper: `frontend/src/api/deals.ts`.

Deal date rules:

- Use `openedAt` as the trading/open-position date.
- UI calendar and list sorting must use `openedAt`.
- `createdAt` is only technical record creation time and should not drive trading views.

### Deal object

Typical response fields:

```json
{
  "id": "uuid",
  "ticker": {
    "id": "uuid",
    "pairName": "EURUSD",
    "icon": "EU"
  },
  "imageUrls": [],
  "deposit": 1000,
  "currency": "USD",
  "riskReward": "2.00R",
  "openedAt": "2026-07-02",
  "description": "Setup notes",
  "createdAt": "2026-07-02T12:00:00",
  "result": "PROFIT",
  "session": "london",
  "links": [
    {
      "title": "Chart",
      "url": "https://example.com"
    }
  ]
}
```

Allowed `result` values:

- `PROFIT`
- `BE`
- `LOSS`

Allowed `session` values:

- `london`
- `frankfurt`
- `asia`
- `new york`

### `GET /deal?userId={userId}&accountId={accountId?}`

Returns all deals for a user, optionally scoped to account.

Used by frontend as:

```http
GET /api/deal?userId={userId}&accountId={accountId}
```

### `GET /deal/{id}?userId={userId}`

Returns one deal if it belongs to the user, otherwise `404`.

### `POST /deal`

Creates a deal.

Request:

```json
{
  "tickerPairId": "uuid",
  "userId": "uuid",
  "accountId": "uuid",
  "deposit": 1000,
  "currency": "USD",
  "riskReward": "2.00R",
  "openedAt": "2026-07-02",
  "result": "PROFIT",
  "session": "london",
  "links": [
    {
      "title": "Chart",
      "url": "https://example.com"
    }
  ],
  "description": "Setup notes"
}
```

Notes:

- `tickerPairId` must belong to the same user.
- If `accountId` is blank, service uses primary account.
- If `openedAt` is missing, backend currently falls back to current date.

### `PUT /deal?dealId={dealId}&userId={userId}`

Updates a deal owned by user.

Request body uses the same shape as `POST /deal`.

### `DELETE /deal?dealId={dealId}&userId={userId}`

Deletes a deal owned by user.

### `POST /deal/{id}/images?userId={userId}`

Uploads one or more screenshots for a deal.

Content type: `multipart/form-data`.

Parts:

- `images` - one or more image files.

Returns updated deal.

## Ticker Pairs

Frontend wrapper: `frontend/src/api/pairs.ts`.

### `GET /pair?userId={userId}`

Returns ticker pairs for user.

Side effect:

- Ensures default pairs exist for the user: `EURUSD`, `GBPUSD`, `US30`, `GER40`.
- Existing pairs are not duplicated.

### `POST /pair`

Creates pair or returns existing duplicate for user.

Request:

```json
{
  "userId": "uuid",
  "pairName": "EURUSD",
  "icon": "EU"
}
```

Response:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "pairName": "EURUSD",
  "icon": "EU"
}
```

Notes:

- `pairName` is normalized to uppercase.
- Blank `icon` becomes `null`.
- Uniqueness is `(user_id, pair_name)`.

## Accounts

Current controller file: `AccountController`.

Important known issue:

- It is annotated as `@RestController("/accounts")`, not `@RequestMapping("/accounts")`.
- In Spring MVC, `@RestController` value is a bean name, not a route prefix.
- Intended routes are documented below, but current runtime mappings may be root-level `GET /`, `POST /`, and `GET /props` unless the controller is fixed.

Intended protected endpoints:

### `GET /accounts?userId={userId}`

Returns all accounts for user.

### `GET /accounts/props?userId={userId}`

Returns prop accounts for user.

### `POST /accounts?userId={userId}`

Creates account for user.

Request:

```json
{
  "active": true,
  "isProp": false,
  "propName": null,
  "propDeposit": null,
  "deposit": 10000
}
```

## Error Handling

Common errors:

- `400 Bad Request` with text body for validation errors.
- `401 Authentication is required` when token is missing on protected endpoints.
- `401 Invalid or expired token` when JWT parsing fails.
- `404` for deal lookup when deal does not belong to user.
- `500` text body for deal image storage `IllegalStateException`.
