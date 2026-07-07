# 🚀 Enterprise Task & Team Management Backend API

A production-ready REST API and database layer for enterprise team and task management. Built with **Node.js**, **Express.js**, **MySQL**, and **Sequelize ORM**, it features a secure JWT-based authentication system, Role-Based Access Control (RBAC), and a fully normalized relational database schema.

---

## 🏗️ Architecture & Database Design

The database schema is fully normalized and supports key One-to-Many and Many-to-Many relationships:

```mermaid
erDiagram
    DEPARTMENTS ||--o{ USERS : "has many"
    DEPARTMENTS ||--o{ PROJECTS : "has many"
    PROJECTS ||--o{ TASKS : "has many"
    USERS ||--o{ TASKS : "assigned to"
    USERS }|..|{ PROJECTS : "project members"
