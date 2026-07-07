# SoundForge — Frontend (React + Vite)

Infrastructure skeleton only. The `src/` folders are empty — build the app yourselves.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

## Run

```bash
npm run dev       # Vite dev server -> http://localhost:5173
npm run build     # production build
npm run preview   # preview the build
```

> Create `src/main.jsx` as your React entry point (index.html already references it).
> `/api` requests are proxied to the backend on :5000 (see `vite.config.js`).

## Structure

```
src/
  api/          # axios instance + API calls
  assets/       # images, fonts, audio
  components/   # reusable UI
  context/      # global state (e.g. auth)
  pages/        # route-level views
  main.jsx      # <- you create this (React entry)
```

## Installed dependencies

- **react**, **react-dom** — UI library
- **react-router-dom** — routing / protected routes
- **axios** — REST calls to the backend
- **@stripe/react-stripe-js**, **@stripe/stripe-js** — Stripe checkout UI
- **vite**, **@vitejs/plugin-react** _(dev)_ — build tooling
