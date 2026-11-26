# Week 3: Database Architecture & REST API Layer

Branch: `feature/database-api-layer`  
ORM: Sequelize (MySQL primary via `mysql2`; `DB_DIALECT=sqlite` supported for local/automated testing without a running MySQL server).

## Models & Relationships
- **Department** (`departments`): `1:N` with `User` and `Project`
- **User** (`users`): `N:1` with `Department`, `1:N` assigned `Task`s, `M:N` with `Project` via `ProjectMember`
- **Project** (`projects`): `N:1` with `Department`, `1:N` with `Task`, `M:N` with `User`
- **Task** (`tasks`): `N:1` with `Project` and `User`

## Endpoints
- `GET/POST /api/departments`, `GET/PUT/DELETE /api/departments/:id`
- `GET/POST /api/users`, `PUT/DELETE /api/users/:id`
- `GET/POST /api/projects`, `POST /api/projects/:id/members`, `PUT/DELETE /api/projects/:id`
- `GET/POST /api/tasks`, `PUT/DELETE /api/tasks/:id`

List endpoints support `?page=1&limit=10&search=&sortBy=&order=ASC|DESC` plus resource-specific filters (`status`, `priority`, `role`, `departmentId`, `projectId`).
