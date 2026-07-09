# MedCareX Healthcare Management System

MedCareX is a deployable healthcare ERP MVP built for the final internship project. It includes JWT authentication, RBAC, patient management, doctor and department management, appointment workflows, dashboard analytics, activity logs, MySQL, Sequelize, a Next.js frontend, and CI-ready project structure.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, lucide-react
- Backend: Node.js, Express.js
- Database: MySQL, Sequelize
- Security: JWT, bcrypt, Helmet, CORS, rate limiting, RBAC
- Additional: Cloudinary config placeholder, Docker Compose, GitHub Actions

## Project Structure

```text
medcarex-healthcare-system/
  backend/
    src/config
    src/controllers
    src/middleware
    src/models
    src/routes
    src/seeders
    src/validators
  frontend/
    src/app
    src/lib
  docs/
  .github/workflows
```

## Quick Start

1. Copy environment values:

```bash
cp .env.example .env
```

2. Fill `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, and optional Cloudinary variables in `.env`.

3. Install dependencies:

```bash
npm install
```

4. Create and seed the MySQL database:

```bash
npm run seed
```

The seed script creates `DB_NAME` automatically if your MySQL user has permission.

5. Start backend and frontend in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Backend: `http://localhost:8000`

Frontend: `http://localhost:3000`

Demo admin after seeding:

```text
admin@medcarex.local
Admin@12345
```

## Docker

```bash
docker compose up --build
```

The compose file starts MySQL, backend API, and frontend app. Run the seed command once inside the backend container or locally after MySQL is healthy.

## Roles

- `admin`: full access to departments, doctors, patients, appointments, dashboard
- `receptionist`: patient intake and appointment booking
- `nurse`: patient viewing/editing and appointment updates
- `doctor`: patient viewing, appointment history, dashboard visibility
- `patient`: can register and browse doctors

## Core API

See [docs/API.md](docs/API.md).

## Production Notes

- `.env.example` documents all required runtime values.
- Passwords are hashed with bcrypt.
- JWT auth is enforced through centralized middleware.
- Express validation rejects malformed input.
- Sequelize models define clear associations.
- Activity logs are recorded on key actions.
- `/health` confirms the API process is alive; `/ready` confirms database connectivity.
- Backend startup retries the database connection and shuts down gracefully on `SIGINT`/`SIGTERM`.
- Port conflicts now fail with a clear message instead of an unhandled crash.
- Database errors are normalized before returning to the frontend, avoiding raw SQL leaks.
- Frontend requests have timeouts and partial dashboard loading so one failing endpoint does not break the whole workspace.
- GitHub Actions runs backend tests and frontend build checks.
- Cloudinary variables are ready for report/image upload integration.

## Branch

Expected branch name:

```text
feature/medcarex-healthcare-system
```
