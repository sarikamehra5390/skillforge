# SkillForge

SkillForge is a full-stack practice tracker that combines skill and session management with XP, streaks, achievements, analytics, friend activity, and a customizable Sanctuary.

## Project structure

- `Frontend/` — React 19, Vite, React Router, Zustand, Axios, Tailwind CSS, and Recharts.
- `Backend/` — Express 5 API, Mongoose models, JWT authentication, and gamification rules.
- `docs/` — project design and supporting documentation.

The browser calls the API under `/api`. The backend listens on port 5000 by default and exposes `/api/health` for service and database status.

## Requirements

- Node.js 20.19 or later (the frontend package declares this minimum).
- npm compatible with the checked-in package lockfiles.
- MongoDB for authenticated API use.

## Local setup

1. Copy `Backend/.env.example` to `Backend/.env` and provide a MongoDB connection string and a private JWT secret. Use a random secret of at least 32 characters for production.
2. Copy `Frontend/.env.example` to `Frontend/.env` if the API is not at `http://localhost:5000/api`.
3. Install dependencies from each application directory with `npm ci`.
4. Start the API from `Backend/` with `npm run dev`.
5. Start the web app from `Frontend/` with `npm run dev`.

The frontend development server defaults to `http://localhost:5173`. Configure `FRONTEND_URL` to the deployed frontend origin in production. Configure `VITE_API_URL` as the complete API base URL, including `/api`; Vite environment values are public and must not contain secrets.

## Environment variables

### Backend (`Backend/.env`)

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Private signing secret for authentication tokens. |
| `PORT` | API port; defaults to `5000`. |
| `FRONTEND_URL` | Allowed browser origin; defaults to local Vite during development. |
| `NODE_ENV` | Set to `production` for production checks and error responses. |

### Frontend (`Frontend/.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL; defaults to `http://localhost:5000/api`. |

## Scripts

Run these from the indicated directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| `Frontend/` | `npm run dev` | Start Vite development server. |
| `Frontend/` | `npm test` | Run focused Sanctuary settings regression tests. |
| `Frontend/` | `npm run lint` | Run ESLint. |
| `Frontend/` | `npm run build` | Create the production frontend build in `dist/`. |
| `Frontend/` | `npm run preview` | Preview the production build locally. |
| `Backend/` | `npm run dev` | Start the API with nodemon. |
| `Backend/` | `npm start` | Start the API with Node.js. |
| `Backend/` | `npm test` | Run the Node test suite (currently gamification, settings schema, and ID validation). |

## Deployment notes

Deploy the frontend as a static Vite build and the backend as a Node.js service. Set the production environment variables in the hosting provider, restrict MongoDB network access, and set `FRONTEND_URL` to the exact frontend origin. Check `GET /api/health` after deployment; a healthy response requires an active MongoDB connection. The repository does not include hosting-specific deployment manifests.

Audio playback requires a user gesture in browsers that restrict autoplay. Audio preferences and visual ambience settings are separate.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the local workflow and change guidelines.
