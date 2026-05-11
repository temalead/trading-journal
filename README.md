# Trading Journal Core

Проект разделен на два модуля:

- `backend` - Spring Boot API.
- `frontend` - React + TypeScript + Vite UI.

## Backend

```bash
cd backend
./mvnw spring-boot:run
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server проксирует `/api/*` на `http://localhost:8080`.
