# SmartVyapar Enterprise Dashboard

A full-stack, enterprise-grade, Role-Based Access Control (RBAC) web application featuring a stunning UI with a holographic login experience and complete backend authentication using Node.js, Express, Sequelize (MySQL), and Next.js.

---

##  Implemented Features

### Frontend (Next.js)
- **Holographic Login Page:** A highly polished login screen featuring an animated holographic sheen overlay on the side panel, and smooth cubic-bezier sliding animations.
- **Role-Based Routing:** Three completely isolated dashboard views:
  - `Admin`: System-wide analytics, revenue charts, user management.
  - `Manager`: Team pipeline, active workflow monitoring, products list.
  - `Employee`: Personal task tracking, self-assigned orders.
- **Multi-Step Password Recovery:** A seamless "Forgot Password" UI integrating a 3-step Email OTP flow.
- **Google OAuth Integration:** "Continue with Google" button handling automated profile creation and token issuance.
- **Profile Synchronization:** Live updates to "Display Name" within the Settings page which propagates instantly across the UI.
- **Hydration Safe:** All inputs protected via `suppressHydrationWarning` to prevent plugin mismatches.

### Backend (Node.js + Express)
- **Email OTP Recovery:** Integrated `nodemailer` alongside an `Otp` MySQL table to generate 6-digit access codes sent directly to user emails.
- **JWT & Encryption:** Standard stateless auth implementation using JSON Web Tokens. Passwords securely hashed via `bcryptjs`. Fixed cryptographic issues inside the Google Auth handler.
- **Security Middlewares:** 
  - `helmet`: Automatically sets 14+ secure HTTP headers.
  - `express-rate-limit`: Blocks brute force attacks (max 20 requests / 15 mins) on `/api/auth` routes.
- **Dynamic Endpoints:** Complete set of REST endpoints bridging the DB to the frontend.

---

##  Setup Instructions

### 1. Database Setup
1. Ensure MySQL is installed and running (`localhost:3306`).
2. Login to MySQL and create the database:
   ```sql
   CREATE DATABASE smartvyapar;
   ```

### 2. Backend Environment (`auth-system`)
1. Navigate to `InternWork/auth-system`.
2. Rename `.env.example` to `.env` or create a new `.env` file.
3. Add your MySQL credentials and a secure JWT secret:
   ```env
   PORT=8000
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=smartvyapar
   JWT_SECRET=super_secret_jwt_key
   JWT_EXPIRES_IN=1h
   ```

#### configure Email (SMTP) for OTPs:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_character_app_password
   ```

### 3. Running the Backend
In the `auth-system` directory:
```bash
npm install
node server.js
```
*The server will start on port 8000 and automatically sync your database tables.*

### 4. Running the Frontend
1. Navigate to `InternWork/admin-dashboard`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` in your browser.

---

##  API Documentation

The backend exposes several routes handling authentication and user profile management. All routes are prefixed with `/api`.

### Base URL: `http://localhost:8000/api`

### Auth Endpoints

#### 1. Register
- **Endpoint:** `POST /auth/register`
- **Description:** Creates a new user account.
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "role": "employee" // optional: 'admin', 'manager', 'employee'
  }
  ```
- **Response:** `201 Created`

#### 2. Login
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticates a user and returns a JWT.
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "user": { "id": "...", "name": "...", "email": "...", "role": "..." }
    }
  }
  ```

#### 3. Google Auth
- **Endpoint:** `POST /auth/google`
- **Description:** Exchanges a Google Access Token for an internal JWT.
- **Request Body:**
  ```json
  {
    "access_token": "ya29.a0AfB_..."
  }
  ```

#### 4. Forgot Password
- **Endpoint:** `POST /auth/forgot-password`
- **Description:** Generates a 6-digit OTP and sends it to the user's email via SMTP.
- **Request Body:**
  ```json
  { "email": "user@example.com" }
  ```
- **Response:** `200 OK` (OTP sent)

#### 5. Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Description:** Verifies the 6-digit code. Returns a temporary reset token.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response:** `200 OK`
  ```json
  { "success": true, "data": { "resetToken": "temp_jwt_token" } }
  ```

#### 6. Reset Password
- **Endpoint:** `POST /auth/reset-password`
- **Description:** Accepts the temporary reset token and a new password. Updates the database.
- **Request Body:**
  ```json
  {
    "resetToken": "temp_jwt_token",
    "newPassword": "newsecurepassword!"
  }
  ```
- **Response:** `200 OK`

---

### User Endpoints

#### 1. Update Profile
- **Endpoint:** `PATCH /users/profile`
- **Description:** Updates the display name of the currently authenticated user.
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:**
  ```json
  { "name": "New Display Name" }
  ```
- **Response:** `200 OK`
