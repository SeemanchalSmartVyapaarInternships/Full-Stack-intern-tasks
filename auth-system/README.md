# 🔐 Secure Authentication & Authorization System

Enterprise-level authentication and authorization module built with **Node.js**, **Express.js**, **JWT**, **bcrypt**, **MySQL**, and **Sequelize** featuring Role-Based Access Control (RBAC).

---

## 🏗️ Architecture

```
auth-system/
├── server.js                  # Entry point
├── config/
│   └── db.js                  # Sequelize + MySQL connection
├── models/
│   ├── index.js               # Model loader
│   └── User.js                # User model with bcrypt hooks
├── middleware/
│   ├── auth.js                # JWT verification
│   ├── role.js                # RBAC authorization
│   └── validate.js            # Input validation
├── controllers/
│   ├── authController.js      # Register / Login / Profile
│   └── adminController.js     # Admin user management
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── adminRoutes.js         # /api/admin/*
│   └── roleRoutes.js          # /api/manager/* & /api/employee/*
└── utils/
    └── helpers.js             # Response formatters
```

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+
- **MySQL** 8.0+
- A MySQL database created:
  ```sql
  CREATE DATABASE auth_system_db;
  ```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 3. Install & Run
```bash
npm install
npm run dev
```

The server starts at `http://localhost:5000`. A default **admin** user is seeded automatically.

---

## 📡 API Endpoints

### Auth (Public)
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | `/api/auth/register`  | Register new user  |
| POST   | `/api/auth/login`     | Login & get JWT    |

### Auth (Protected)
| Method | Endpoint              | Auth | Description        |
|--------|-----------------------|------|--------------------|
| GET    | `/api/auth/profile`   | Any  | View own profile   |

### Admin (Admin Only)
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | `/api/admin/users`              | List all users       |
| PUT    | `/api/admin/users/:id/role`     | Update user role     |
| DELETE | `/api/admin/users/:id`          | Delete user          |

### Role-Based
| Method | Endpoint                    | Roles                  | Description          |
|--------|-----------------------------|------------------------|----------------------|
| GET    | `/api/manager/reports`      | Admin, Manager         | Manager reports      |
| GET    | `/api/employee/dashboard`   | Admin, Manager, Employee| Employee dashboard  |

### Utility
| Method | Endpoint          | Description    |
|--------|-------------------|----------------|
| GET    | `/api/health`     | Health check   |

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Secure@123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@1234"}'
```

### Access Protected Route
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Admin: List Users
```bash
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## 🔒 Security Features

- **bcrypt** password hashing (12 salt rounds)
- **JWT** with HS256 signing & 24h expiry
- **Helmet** for security headers
- **Rate limiting** on auth endpoints (100 req / 15 min)
- **CORS** enabled
- **Input validation** with strong password policy
- **Passwords excluded** from all API responses
- **Centralized error handling**

## 🎭 Roles

| Role     | Access Level                                         |
|----------|------------------------------------------------------|
| Admin    | Full access — manage users, reports, dashboard       |
| Manager  | Reports + dashboard                                  |
| Employee | Dashboard only                                       |

---

## 📋 Default Admin Credentials

| Field    | Value              |
|----------|--------------------|
| Email    | admin@example.com  |
| Password | Admin@1234         |

> ⚠️ Change these in production via `.env` variables.
