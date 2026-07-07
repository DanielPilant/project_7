# SoundForge — Backend (Node + Express + MySQL)

Infrastructure skeleton only. The MVC layers are empty — fill them in yourselves.

## Setup

```bash
cd backend
npm install
cp .env.example .env      # then fill in real values
```

## Run

```bash
npm run dev     # nodemon (auto-reload)
npm start       # plain node
```

> npm scripts point to `src/index.js` — create that file as your Express entry point.

## Structure

```
src/
  config/       # db connection pool, app config
  models/       # DB access (SQL lives here)
  services/     # business logic / validation
  controllers/  # HTTP request/response handlers
  routes/       # Express routers (mounted under /api)
  middleware/   # auth (JWT + roles), error handling
  index.js      # <- you create this (app entry)
db/             # SQL schema / migrations
```

## Installed dependencies

- **express** — web framework
- **mysql2** — MySQL driver (supports promises + pooling)
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT auth
- **stripe** — checkout / payments
- **cloudinary** — media (audio/image) storage
- **multer** — multipart/file uploads
- **cors** — cross-origin requests from the React app
- **dotenv** — loads `.env`
- **nodemon** _(dev)_ — auto-reload
