# Propulserie — E-learning Platform

E-learning platform for **students**, **mentors**, and **admins**: exploration journeys, individual capsules, questionnaires, mentoring sessions, payments, and AI-assisted reports (Marii).

This workspace contains three applications that work together.

---

## Project structure

```text
marie_wagner85_E-learning/
├── e-learning_backend/                 # API + business logic
├── E-learning_Custom_webstie_Marie/    # Public / student / mentor web app
└── E-learning_Custom_webstie_Marie_Admin/  # Admin dashboard
```

| Folder | Role | Stack | Default port |
|--------|------|--------|--------------|
| `e-learning_backend` | REST API, auth, Stripe, queues, AI reports, media | Node.js, Express, TypeScript, MongoDB, BullMQ | from `.env` (often `8005` / `8080`) |
| `E-learning_Custom_webstie_Marie` | Student & mentor experience | Next.js, React, Redux Toolkit, Tailwind, Ant Design | `8002` |
| `E-learning_Custom_webstie_Marie_Admin` | Content & platform administration | Vite, React, Redux Toolkit, Tailwind, Ant Design | `8003` |

---

## Architecture (high level)

```text
[ Student / Mentor app :8002 ] ──┐
                                 ├──► [ Backend API ] ──► MongoDB / Redis / S3 / Stripe / Email
[ Admin app :8003 ] ─────────────┘
```

- Frontends call the backend under `/api/v1`.
- Set the API base URL in each frontend before running against local or staging.

---

## 1. Backend — `e-learning_backend`

### Prerequisites

- Node.js
- MongoDB
- Redis (queues / BullMQ)
- Optional: Docker (see `docker-compose.dev.yml`)

### Setup

```bash
cd e-learning_backend
npm install
cp .env.example .env
# Edit .env with MongoDB, JWT, SMTP, Stripe, AWS, etc.
```

### Run

```bash
npm run dev
```

Useful scripts:

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build & run |
| `npm run seedAll` | Seed admin, mentors, students, journeys, capsules |
| `npm run docker:up` | Start with Docker Compose (dev) |

More detail: see `e-learning_backend/README.md` and `.env.example`.

**Do not commit** `.env` or secrets.

---

## 2. Student / Mentor app — `E-learning_Custom_webstie_Marie`

### Setup

```bash
cd E-learning_Custom_webstie_Marie
npm install
```

Point the API URL at your backend in:

`src/redux/api/baseUrl.js`

### Run

```bash
npm run dev
```

App: [http://localhost:8002](http://localhost:8002)

```bash
npm run build
npm start
```

---

## 3. Admin app — `E-learning_Custom_webstie_Marie_Admin`

### Setup

```bash
cd E-learning_Custom_webstie_Marie_Admin
npm install
```

Point the API URL at your backend in:

- `src/redux/baseApi/baseApi.js`
- `src/redux/baseApi/forImageUrl.js` (media / image base URL)

### Run

```bash
npm run dev
```

App: [http://localhost:8003](http://localhost:8003)

```bash
npm run build
npm run preview
```

---

## Recommended local startup order

1. Start MongoDB (and Redis if required).
2. Start **backend** and confirm it is reachable.
3. Start **student/mentor** app (`8002`).
4. Start **admin** app (`8003`).

---

## Main product areas

- **Auth** — registration, login, JWT, roles (student / mentor / admin)
- **Exploration journey** — capsule-based learning path
- **Individual capsules** — categories, content, commercial fields
- **Free questionnaire** — onboarding / discovery flow + personalized summary
- **Mentors** — sessions, purchases, wallet-related flows
- **Payments** — Stripe integration
- **Admin CMS** — journeys, capsules, questionnaires, settings, legal pages
- **Marii** — AI-assisted reporting / questionnaire insights

---

## Local extras

`_extra/` folders (root and per project) hold local docs, feedback files, and tools. They are listed in `.gitignore` and are **not** part of the deliverable codebase.

---

## Notes for deployment

- Configure production API URLs in both frontends.
- Configure Stripe webhook URL to the backend payment webhook endpoint.
- Set `CLIENT_URL` and Stripe success/cancel URLs in backend `.env`.
- Ensure CORS and allowed hosts match your public domains.

### Backend CI/CD (monorepo → EC2)

- **CI:** `.github/workflows/ci-backend.yml` — builds `e-learning_backend` on PRs/pushes that touch that folder.
- **CD:** `.github/workflows/deploy-backend.yml` — on `main` (backend paths only): build/push image to GHCR, SSH to EC2, `docker compose pull && up`.
- Health: `GET /health` (liveness), `GET /ready` (Mongo + Redis).
- On EC2: keep prod secrets in `e-learning_backend/.env`; set `API_IMAGE` via `.env.deploy` (see `e-learning_backend/.env.deploy.example`).

### Website CI/CD (Next.js → same EC2)

- **CI:** `.github/workflows/ci-website.yml` — builds `E-learning_Custom_webstie_Marie`.
- **CD:** `.github/workflows/deploy-website.yml` — on `main` (website paths only): Docker image → GHCR → EC2 `docker compose up`.
- `NEXT_PUBLIC_API_BASE_URL` is baked at **image build** time — set GitHub Actions **variable** `NEXT_PUBLIC_API_BASE_URL` (Settings → Variables).
- On EC2: app dir + `.env.deploy` (see `E-learning_Custom_webstie_Marie/.env.deploy.example`); Nginx → host port `8002`.

### Shared GitHub secrets / vars (EC2)

| Name | Type | Used by |
|------|------|---------|
| `EC2_HOST` | secret | backend + website deploy |
| `EC2_USER` | secret | backend + website deploy |
| `EC2_SSH_KEY` | secret | backend + website deploy |
| `EC2_APP_DIR` | secret | backend compose path |
| `EC2_WEB_APP_DIR` | secret | website compose path |
| `GHCR_USERNAME` | secret | docker login on EC2 |
| `GHCR_PULL_TOKEN` | secret | PAT with `read:packages` |
| `NEXT_PUBLIC_API_BASE_URL` | variable | website image build (API origin, no `/api/v1`) |
