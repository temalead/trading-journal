# Codex Working Rules

Этот файл - рабочая памятка для Codex и разработчика при изменениях в `trading-journal-core`.

## Главные правила

1. Сначала читать существующий код и следовать текущим паттернам.
2. Не откатывать чужие изменения. В репозитории может быть dirty worktree.
3. Перед правками проверять `git status --short`.
4. Для ручных изменений использовать `apply_patch`.
5. После backend-изменений запускать `cd backend && ./mvnw test`.
6. После frontend-изменений запускать `cd frontend && npm run build` или локальные `tsc`/`vite` binaries.
7. Не менять API shape без обновления `docs/api.md` и frontend types.

## Project Layout

- Backend source: `backend/src/main/java/com/nikulin/tradingjournalcore`
- Backend tests: `backend/src/test/java/com/nikulin/tradingjournalcore`
- Liquibase changelog: `backend/src/main/resources/db/changelog`
- Frontend source: `frontend/src`
- Frontend API wrappers: `frontend/src/api`
- Frontend root state: `frontend/src/App.tsx`
- Shared frontend form types: `frontend/src/types/forms.ts`
- Global styles: `frontend/src/styles.css`

## Backend Rules

### Security

- JWT auth is stateless.
- Auth endpoints are public.
- Business endpoints should be available to role `USER` unless explicitly specified otherwise.
- `JwtAuthenticationFilter` maps roles to Spring authorities as `ROLE_<role>`.
- When adding protected endpoints, update `SecurityConfig`.

### Deals

- Trading date is `Deal.openedAt`.
- Do not use `createdAt` for trading calendar/list sorting.
- `createdAt` is technical record creation time from `AbstractEntity`.
- If a new deal field is added, update:
  - `Deal`
  - `DealDto`
  - `DealService.createDeal`
  - `DealService.update`
  - Liquibase changelog
  - frontend `Deal` / `CreateDealPayload`
  - form state and drawer if user-editable

### Liquibase

- Add new changes under `backend/src/main/resources/db/changelog/changes`.
- Include new files in `db.changelog-master.yaml`.
- Prefer additive migrations.
- For non-null columns on existing tables, backfill before adding `NOT NULL`.

### Ticker Pairs

- Every user should have defaults: `EURUSD`, `GBPUSD`, `US30`, `GER40`.
- Current implementation lazy-seeds defaults in `TickerPairService.getPairs(userId)`.
- Do not duplicate pairs; lookup by `userId` and case-insensitive `pairName`.

### Accounts

- Known issue: `AccountController` uses `@RestController("/accounts")`; this does not create route prefix.
- Fix should be `@RestController` plus `@RequestMapping("/accounts")`.
- If fixing it, verify frontend/API docs/security paths.

## Frontend Rules

### API and Auth

- Frontend calls `/api/*`.
- Vite rewrites `/api` away in local dev.
- Store auth session in localStorage via `utils/sessionStorage.ts`.
- Logout is UI-only/stateless: clear storage, clear app state, return to auth page.

### Deals UI

- Deal creation/edit drawer is `components/DealDrawer.tsx`.
- Deal table row is `components/DealRow.tsx`.
- Deals page is `components/DealsView.tsx`.
- Calendar is `components/CalendarView.tsx`.
- Date display, PnL, risk reward parsing, and calendar grouping helpers belong in `utils/format.ts`.

### Open Date

- Form field is `openedAt`.
- It must be sent as `YYYY-MM-DD`.
- Calendar and list grouping must use `dealDateKey(deal)`, which prefers `openedAt` and falls back to `createdAt` only for old data.

### Deals List Views

- Default list view should show only current month.
- User can switch to `Month`, `Year`, or `All`.
- `Year` and `All` should show month separators.
- Sort by `openedAt` descending.

### Calendar

- Calendar day should show:
  - number of deals
  - ticker names
  - summed profit percent
- Profit percent is derived from `riskReward`:
  - `PROFIT` uses parsed R value
  - `BE` is `0%`
  - `LOSS` is `-1%`

### Pairs UI

- Pairs screen should stay user-friendly: preview, quick presets, and readable pair cards.
- Default pair presets should match backend defaults.

## Verification Commands

Backend:

```bash
cd backend
./mvnw test
```

Frontend:

```bash
cd frontend
npm run build
```

If Codex shell has no `npm`:

```bash
cd frontend
PATH=/Users/tema/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/tsc -b
PATH=/Users/tema/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/vite build
```

## Documentation Rule

When adding or changing endpoints, payload fields, auth behavior, or major UI behavior, update:

- `docs/api.md`
- `docs/agent-rules.md` if it changes the way Codex should work
