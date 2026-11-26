# MedCareX Healthcare Management MVP (Weeks 5-6)

Branch: `feature/medcarex-healthcare-system`

## Architecture
- `backend/`: Express.js + Sequelize ORM (SQLite local default `./data/medcarex.sqlite` or MySQL via `.env`), `bcryptjs` + JWT authentication, RBAC (`Admin`, `Manager`, `Employee`), Patients, Doctors, Departments, Appointments, Dashboard KPIs, and Activity Logs.
- `frontend/`: Next.js + React + Tailwind CSS clinical management UI connected to `NEXT_PUBLIC_API_URL` (`http://127.0.0.1:5001/api`).

## Run Locally
1. Terminal 1: `npm run start:backend` (seeds demo data on port `5001`)
2. Terminal 2: `npm --prefix frontend run dev` (starts Next.js on port `3001`)
3. Sign in with 1-click demo accounts (`admin@medcarex.in`, `manager@medcarex.in`, `staff@medcarex.in`, password `DemoPass@123`).
