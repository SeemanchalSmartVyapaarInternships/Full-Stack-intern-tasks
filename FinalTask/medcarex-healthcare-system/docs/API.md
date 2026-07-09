# MedCareX API Documentation

Base URL:

```text
http://localhost:8000/api
```

All protected routes require:

```text
Authorization: Bearer <jwt_token>
```

## Health

### GET `/health`

Returns API health.

## Authentication

### POST `/auth/register`

Body:

```json
{
  "name": "Reception User",
  "email": "reception@medcarex.local",
  "password": "Reception@12345",
  "role": "receptionist"
}
```

Public admin registration is only granted when `role` is `admin` and `adminInviteCode` matches `ADMIN_INVITE_CODE`.

### POST `/auth/login`

Body:

```json
{
  "email": "admin@medcarex.local",
  "password": "Admin@12345"
}
```

### GET `/auth/me`

Returns the current authenticated user.

## Patients

Roles: `admin`, `doctor`, `receptionist`, `nurse`

### GET `/patients?q=&page=1&limit=20`

Searches by patient code, name, phone, or email.

### POST `/patients`

Roles: `admin`, `receptionist`, `nurse`

```json
{
  "firstName": "Aarav",
  "lastName": "Mehta",
  "email": "aarav@example.com",
  "phone": "+91-90000-20001",
  "gender": "male",
  "dateOfBirth": "1994-04-18",
  "bloodGroup": "B+",
  "address": "Mumbai",
  "emergencyContact": "+91-90000-20002",
  "allergies": "Penicillin",
  "medicalHistory": "Mild asthma",
  "insuranceProvider": "Care Health",
  "insuranceNumber": "POL-1001"
}
```

### GET `/patients/:id`

Returns one patient with recent appointments.

### PUT `/patients/:id`

Updates patient details.

## Doctors and Departments

### GET `/doctors/departments`

Lists departments.

### POST `/doctors/departments`

Role: `admin`

```json
{
  "name": "Cardiology",
  "code": "CARD",
  "description": "Heart care and cardiovascular treatment."
}
```

### GET `/doctors?departmentId=&q=`

Lists doctor profiles with user and department details.

### POST `/doctors`

Role: `admin`

```json
{
  "name": "Dr. Hamida Jannat",
  "email": "doctor@medcarex.local",
  "password": "Doctor@12345",
  "departmentId": "department-uuid",
  "specialization": "Cardiologist",
  "licenseNumber": "MCX-DOC-1001",
  "phone": "+91-90000-10001",
  "experienceYears": 9,
  "consultationFee": 800,
  "availability": {
    "monday": ["09:00", "13:00"]
  }
}
```

### PUT `/doctors/:id`

Updates doctor profile data.

## Appointments

### GET `/appointments?patientId=&doctorId=&status=`

Returns appointment history.

### POST `/appointments`

Roles: `admin`, `receptionist`

```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "scheduledAt": "2026-07-10T09:30:00.000Z",
  "durationMinutes": 30,
  "reason": "Routine cardiac follow-up",
  "notes": "Bring previous ECG report."
}
```

### PUT `/appointments/:id`

Roles: `admin`, `doctor`, `receptionist`, `nurse`

```json
{
  "status": "completed",
  "notes": "Consultation completed."
}
```

## Dashboard

### GET `/dashboard`

Roles: `admin`, `doctor`, `receptionist`, `nurse`

Returns:

- patient count
- active doctor count
- upcoming/today appointment count
- booked appointment count
- department load
- recent activity logs
