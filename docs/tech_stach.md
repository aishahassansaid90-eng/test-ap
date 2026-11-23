# Technology Stack and Architecture
> The requested filename is `tech_stach.md`. The architecture below uses TypeScript for the Next.js frontend and JavaScript (`.js`) for the Node.js backend.

## 1. Technology Stack
### Frontend
- **Next.js** (App Router)
- **TypeScript** (`.ts` / `.tsx`) for all frontend application code
- **Tailwind CSS** for styling
- **shadcn/ui** for reusable interface components
- **React Hook Form** and **Zod** for forms and client-side schemas
- A typed API client using `fetch` or Axios

### Backend
- **Node.js** runtime
- **Express.js** REST API
- **JavaScript only** for backend source files (`.js`); do not convert backend files to TypeScript
- **Prisma ORM** with MySQL
- Zod or express-validator for request validation
- bcrypt for password hashing
- JWT or secure server-side sessions for authentication

### Database
- **MySQL 8**
- Prisma schema and migrations
- Use foreign keys, unique constraints, indexes, and transactions.

### Development and Deployment
- Git and GitHub
- npm
- ESLint and Prettier
- Environment variables in `.env` files (never commit secrets)
- Docker Compose may be used for local MySQL development.
- Deploy frontend and API to supported hosting services; host MySQL on a managed or secured database service.

## 2. High-Level Architecture
```text
Browser
  |
  v
Next.js Frontend (TypeScript / TSX)
  |  HTTPS REST requests
  v
Node.js + Express API (JavaScript)
  |
  v
Prisma ORM
  |
  v
MySQL Database
```

The frontend is responsible for presentation, navigation, and user-friendly validation. The backend is the authority for authentication, authorization, business rules, and data validation. Never rely on hiding a frontend button as the only access-control mechanism.

## 3. Suggested Project Structure
```text
bakka-training-center/
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── admin/
│   │   ├── staff/
│   │   ├── student/
│   │   ├── courses/
│   │   └── verify-certificate/
│   ├── components/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── ui/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── validators/
│   ├── types/
│   └── public/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── students/
│   │   │   ├── staff/
│   │   │   ├── courses/
│   │   │   ├── enrollments/
│   │   │   ├── certificates/
│   │   │   └── reports/
│   │   ├── utils/
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── docs/
│   ├── overview.md
│   ├── tech_stach.md
│   ├── agent_rules.md
│   └── prompts.md
└── README.md
```

## 4. Database Design
Use UUIDs or secure non-guessable identifiers for public-facing record references. Suggested entities:

- **User:** id, fullName, email, phone, passwordHash, role, status, createdAt, updatedAt.
- **Student:** id, userId (optional until account creation), studentNumber, dateOfBirth (only if needed), address (only if needed), emergencyContact (only if required), status.
- **Staff:** id, userId, staffNumber, jobTitle, status.
- **Course:** id, courseCode, title, description, duration, fee, capacity, schedule, status, createdBy.
- **Enrollment:** id, studentId, courseId, enrolledAt, status, reviewedBy, reviewedAt, notes.
- **Certificate:** id, certificateNumber, studentId, courseId, enrollmentId, issuedAt, issuedBy, status, filePath or storageKey.
- **AuditLog:** id, actorUserId, action, entityType, entityId, metadata, createdAt.

### Important constraints
- `User.email` should be unique when present.
- `Student.studentNumber`, `Staff.staffNumber`, `Course.courseCode`, and `Certificate.certificateNumber` must be unique.
- Prevent duplicate active enrollment for the same student and course in application logic and, where practical, database constraints.
- Use foreign keys and appropriate indexes for frequently searched columns.
- Store certificate files in controlled file/object storage; store only a storage key/path and metadata in MySQL.
- Do not store plaintext passwords.

## 5. API Design
Use a versioned prefix such as `/api/v1`.

| Area | Example endpoints | Access |
|---|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Public/authenticated |
| Users | `GET /users`, `PATCH /users/:id/status` | Admin |
| Students | `GET /students`, `POST /students`, `GET /students/:id`, `PATCH /students/:id` | Admin/authorized staff; student self-read |
| Staff | `GET /staff`, `POST /staff`, `PATCH /staff/:id` | Admin |
| Courses | `GET /courses`, `POST /courses`, `PATCH /courses/:id` | Public/authenticated read according to publication; Admin write |
| Enrollments | `GET /enrollments`, `POST /enrollments`, `PATCH /enrollments/:id/status` | Scoped by role |
| Certificates | `GET /certificates`, `POST /certificates`, `GET /certificates/:id/download` | Scoped by role; issuance permission required |
| Reports | `GET /reports/summary` | Admin; limited staff reports |

These are examples; implement consistent request/response schemas and pagination.

## 6. Authorization Strategy
- Authenticate each protected request.
- Load the current user from a trusted session/token.
- Apply role middleware such as `requireRole("ADMIN")`.
- Apply resource-level checks, e.g. a student can read only records whose `student.userId` matches the authenticated user.
- Staff permissions should be explicit and limited to their assigned tasks.
- Deny by default when a permission is not defined.
- Return `401` for unauthenticated requests and `403` for authenticated users lacking permission.
- Test API authorization independently of frontend navigation.

## 7. Environment Variables
Example names only:
```env
# backend
PORT=4000
NODE_ENV=development
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/bakka_training_center"
JWT_SECRET="replace-with-a-long-random-secret"
FRONTEND_URL="http://localhost:3000"

# frontend
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api/v1"
```
Use real secrets only in local environment files or the deployment secret manager. Do not commit `.env`.

## 8. Engineering Standards
- Use TypeScript in `frontend/` and JavaScript in `backend/`.
- Keep business rules in backend services, not React components.
- Use database migrations; do not edit production tables manually.
- Use transactions for multi-step enrollment and certificate issuance.
- Add tests for authentication, permissions, enrollment rules, and certificate issuance.
- Log operational errors without logging passwords, tokens, or unnecessary personal data.
