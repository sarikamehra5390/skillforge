# SkillForge

SkillForge is a skill practice and progress tracking application with a React/Vite frontend and an Express/MongoDB API.

## Local development

1. Install dependencies in `Backend` and `Frontend` with `npm install`.
2. Copy `Backend/.env.example` to `Backend/.env` and set `MONGO_URI` and a private `JWT_SECRET`.
3. Copy `Frontend/.env.example` to `Frontend/.env`. For local development it should contain `VITE_API_URL=http://localhost:5000/api`.
4. Start the API from `Backend` with `npm run dev` (or `npm start`).
5. Start the frontend from `Frontend` with `npm run dev`.

The API listens on port `5000` by default. Its health endpoint is `GET /api/health`; user registration and login are `POST /api/users/register` and `POST /api/users/login`.

For production, set `NODE_ENV=production`, provide the deployed frontend's exact origin in `FRONTEND_URL`, and use a private `JWT_SECRET` with at least 32 characters. Set `VITE_API_URL` to the deployed API's `/api` URL before building the frontend; this value is embedded at build time. Production CORS accepts only the configured frontend origin.

## Frontend checks

Run from `Frontend`:

```sh
npm run lint
npm run build
```

## Environment variables

The frontend reads `VITE_API_URL`, `VITE_API_TIMEOUT_MS` (default 20 seconds for regular API calls), and `VITE_AUTH_TIMEOUT_MS` (default 75 seconds for login, registration, and saved-token validation). The longer authentication timeout allows for Render's documented free-service wake-up period; it does not guarantee the service will respond successfully. Set these Vite values in the frontend deployment environment before building. The backend reads `MONGO_URI`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`, and `NODE_ENV`. Keep actual `.env` files private; only the example files with placeholders belong in source control.
