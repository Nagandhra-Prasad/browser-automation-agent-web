# Browser Automation Agent — Frontend

Angular UI for the [browser-automation-agent-api](https://github.com/) backend: login, chat-style task input, and agent responses.

## Connect to the API

1. Start **MongoDB** and the **FastAPI** API (default `http://localhost:8000`).
2. Edit API URL if needed:

`browser-automation-web/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
};
```

3. Backend `.env` must include CORS for Angular:

```env
CORS_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

## Run

```bash
cd browser-automation-web
npm install
ng serve
```

Open http://localhost:4200 → **Register** (step-by-step wizard) → **Dashboard** → guided tour → **Job search chat**.

**Admin register:** choose Admin in step 1, enter code from API `.env` (`ADMIN_REGISTRATION_CODE`, default `admin123`).

## Chat flow

1. User types a natural language command.
2. User sets **Target website** (e.g. `https://example.com`).
3. Frontend calls `POST /api/v1/chat` with JWT.
4. API plans (AI), runs Playwright, returns summary + extracted items in the chat.

## Project structure

| Path | Purpose |
|------|---------|
| `src/app/services/auth.service.ts` | Login / register |
| `src/app/services/agent.service.ts` | `POST /chat` |
| `src/app/core/auth.interceptor.ts` | Adds `Authorization: Bearer` |
| `src/app/pages/chat/` | Chat UI |
