# Week 2: Authentication & RBAC API Documentation

Branch: `feature/auth-rbac-system`  
Note: Uses an in-memory store (`src/models/userStore.js`) for Week 2 isolation prior to Week 3 MySQL/Sequelize integration.

## Endpoints

| Method | Path | Auth | Allowed Roles | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Any | Service health check |
| `POST` | `/api/auth/register` | Public | Any | Register user (`bcrypt` hashed password), returns JWT |
| `POST` | `/api/auth/login` | Public | Any | Authenticate email/password, returns JWT |
| `GET` | `/api/auth/me` | Bearer JWT | Any authenticated | Get current user profile |
| `GET` | `/api/auth/users` | Bearer JWT | `Admin` | List registered users (without hashes) |
| `PATCH` | `/api/auth/users/:id/role` | Bearer JWT | `Admin` | Update user role (`Admin`, `Manager`, `Employee`) |
| `GET` | `/api/resources/employee` | Bearer JWT | `Admin`, `Manager`, `Employee` | Employee workspace endpoint |
| `GET` | `/api/resources/manager` | Bearer JWT | `Admin`, `Manager` | Manager operations endpoint |
| `GET` | `/api/resources/admin` | Bearer JWT | `Admin` | Admin control plane endpoint |
