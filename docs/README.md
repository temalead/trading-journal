# Trading Journal Core Docs

Этот каталог хранит короткую рабочую документацию по проекту для разработчика и Codex.

## Файлы

- [api.md](api.md) - все текущие backend endpoints, payloads, авторизация и известные нюансы.
- [agent-rules.md](agent-rules.md) - правила работы Codex в этом проекте: как запускать проверки, где искать код, какие договоренности не ломать.

## Обзор проекта

`trading-journal-core` состоит из двух частей:

- `backend` - Spring Boot API, PostgreSQL, Liquibase, JWT auth, MinIO для изображений сделок.
- `frontend` - React + TypeScript + Vite. В dev режиме Vite проксирует `/api/*` на backend и убирает префикс `/api`.

## Основные домены

- `User` - пользователь с ролями `USER`, `ADMIN`, `SUPPORT`.
- `Account` - торговый аккаунт пользователя. При регистрации создается default account.
- `TickerPair` - торговая пара/инструмент пользователя. При запросе пар автоматически добавляются дефолты: `EURUSD`, `GBPUSD`, `US30`, `GER40`.
- `Deal` - сделка пользователя. Для торговой даты используется `openedAt`, а не технический `createdAt`.

## Локальный запуск

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Infrastructure:

```bash
docker compose up -d
```

## Проверки

Backend tests:

```bash
cd backend
./mvnw test
```

Frontend build:

```bash
cd frontend
npm run build
```

Если `npm` недоступен в Codex shell, можно использовать bundled Node из Codex runtime и запускать локальные binaries:

```bash
cd frontend
PATH=/Users/tema/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/tsc -b
PATH=/Users/tema/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/vite build
```
