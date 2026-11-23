# Bakka Training Center Administration System

A secure, responsive, full-stack administration and learning management system built for **Bakka Training Center**.

---

## 1. Project Overview & Architecture

The system centralizes the management of administrators, academic staff, students, courses, student enrollment applications, and official digital certificate verification. Strict authentication and role-based access control (RBAC) are enforced on both backend and frontend layers.

### Architecture
- **Frontend (`frontend/`)**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui components, Lucide icons, Context API for authentication.
- **Backend (`backend/`)**: Node.js & Express REST API using pure JavaScript (`.js`) modules, Zod schema validation, bcrypt password hashing, JWT sessions with HTTP-only cookies.
- **Database**: MySQL / MariaDB managed with Prisma ORM (foreign keys, unique constraints, relational indexes, transactions).

---

## 2. Directory Structure

```text
bakka-training-center/
├── frontend/                     # Next.js App Router (TypeScript)
│   ├── app/                      # App router layouts and pages
│   │   ├── (auth)/login/         # Authentication login with quick-fill demo buttons
│   │   ├── admin/                # Admin portal: Dashboard, Students, Staff, Courses, Enrollments, Certificates, Reports, Audit Logs
│   │   ├── staff/                # Staff portal: Dashboard, Students, Courses, Enrollments, Certificates, Reports
│   │   ├── student/              # Student portal: Dashboard, Profile, Browse, Enrollments, Certificates
│   │   ├── courses/              # Public course catalog and course details
│   │   ├── verify-certificate/   # Public tamper-proof certificate verification registry
│   │   └── unauthorized/         # Friendly 403 access-denied page
│   ├── components/               # UI components, layout shell, printable certificate
│   ├── lib/                      # API client, Auth Context, utility helpers
│   ├── types/                    # TypeScript interfaces
│   └── package.json
├── backend/                      # Express REST API (JavaScript .js only)
│   ├── src/
│   │   ├── config/               # Database and environment configurations
│   │   ├── middleware/           # Auth, RBAC, error handler, rate limiter, validators
│   │   ├── modules/              # Modular controllers, services, and routes
│   │   │   ├── auth/             # Login, logout, current user (/api/v1/auth)
│   │   │   ├── dashboard/        # Role-computed metrics (/api/v1/dashboard)
│   │   │   ├── students/         # Student CRUD & registration (/api/v1/students)
│   │   │   ├── staff/            # Admin-only staff management (/api/v1/staff)
│   │   │   ├── courses/          # Courses & capacity control (/api/v1/courses)
│   │   │   ├── enrollments/      # Applications & review workflows (/api/v1/enrollments)
│   │   │   ├── certificates/     # Certificate issuance & verification (/api/v1/certificates)
│   │   │   ├── reports/          # Operational reports (/api/v1/reports)
│   │   │   └── audit/            # Security audit logs (/api/v1/audit-logs)
│   │   ├── utils/                # Number generators, response helpers, logger
│   │   ├── app.js                # Express app setup and middleware pipeline
│   │   └── server.js             # HTTP server entry point
│   ├── prisma/
│   │   ├── schema.prisma         # Relational database schema
│   │   └── seed.js               # Development seed script with demo accounts
│   ├── tests/                    # Automated Jest & Supertest integration tests
│   └── package.json
├── docs/                         # Source specification documents
│   ├── overview.md
│   ├── tech_stach.md
│   ├── agent_rules.md
│   └── prompts.md
├── package.json                  # Root monorepo workspace configuration
└── README.md
```

---

## 3. Development-Only Demo Accounts

The database seed provides pre-configured demo credentials for each role:

| Role | Email Address | Password | Permissions & Dashboard |
|---|---|---|---|
| **ADMIN** | `admin@bakka.edu` | `Admin@123456` | Full administrative access: Staff management, course publishing, certificate issuance, system audit logs, reports. |
| **STAFF** | `staff@bakka.edu` | `Staff@123456` | Student registration, course viewing, enrollment review & progress updates, rosters, certificate viewing. |
| **STUDENT** | `student@bakka.edu` | `Student@123456` | Learner portal: Self-profile, course catalog application, active enrollments tracking, verified certificate viewing/printing. |
| **STUDENT** | `ahmed@bakka.edu` | `Student@123456` | Alternate demo student account for multi-user isolation verification. |

*(Note: The login page at `/login` includes one-click buttons to quickly fill credentials for any of these roles).*

---

## 4. Getting Started & Setup Instructions

### Prerequisites
- **Node.js** (v18.x, v20.x, or v24.x)
- **npm** (v10+ or v11+)
- **MySQL 8.x** or **MariaDB** (running on `localhost:3306`, e.g., via XAMPP or MySQL Service)

### Step 1: Clone and Environment Configuration

Create the backend environment file:
```bash
# backend/.env
PORT=4000
NODE_ENV=development
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/bakka_training_center"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
COOKIE_SECRET="replace-with-a-long-random-secret"
FRONTEND_URL="http://localhost:3000"
```

Create the frontend environment file:
```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api/v1"
```

### Step 2: Database Migration & Seeding

Ensure MySQL is running and execute:
```bash
# From the backend directory:
cd backend
npm install
npx prisma db push
npm run seed
```

This creates the tables (`user`, `student`, `staff`, `course`, `enrollment`, `certificate`, `auditlog`) and populates demo users, courses, active enrollments, and an issued certificate.

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 5. Running the Application

### Start the Backend API (Port 4000)
```bash
cd backend
npm run dev
# Or: node src/server.js
```
- Health Check: `http://localhost:4000/api/v1/health`
- Base API: `http://localhost:4000/api/v1`

### Start the Frontend Application (Port 3000)
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Testing & Quality Assurance

The backend includes automated integration tests covering authentication, RBAC boundaries, student privacy isolation, duplicate enrollment prevention, course capacity limits, and certificate issuance rules.

Run the test suite:
```bash
cd backend
npm test
```

### Automated Tests Verified:
- `auth.test.js`: Valid login, invalid credentials (401), non-existent users, JWT token verification, `/auth/me`, logout cookie clearance.
- `authorization.test.js`: Staff access to staff management denied (403), Student access to staff management denied (403), Student data isolation (Student A cannot read Student B's records), Student access to audit logs denied (403).
- `enrollments.test.js`: Duplicate active enrollment prevention (409), unpublished course enrollment prevention (400), Student unauthorized approval attempt blocked (403).
- `certificates.test.js`: Public certificate verification (`/certificates/verify/:code`) returns safe validity details without exposing passwords or personal data; Student direct issuance blocked (403).

Frontend build verification:
```bash
cd frontend
npm run type-check   # Verifies TypeScript types with zero errors
npm run build        # Compiles all 27 pages with static optimization
```

---

## 7. Security & Business Rules Compliance

- **Authentication**: Passwords hashed with `bcryptjs`. JWT tokens delivered in HTTP-only, secure cookies with fallback Authorization headers.
- **Role Isolation**: Direct API requests check role middleware and resource ownership.
- **Unique Identifiers**: Auto-generates standardized identifiers:
  - Students: `STU-YYYY-XXXX`
  - Staff: `STF-YYYY-XXXX`
  - Certificates: `BK-YYYY-XXXXXX`
- **Enrollment Workflow**: Enforces capacity limits, prevents duplicate active applications for the same course, and tracks reviewer identity and timestamps.
- **Certificate Verification**: Public endpoint and verification page disclosure reveals only minimum required data (Student Name, Course, Issue Date, Validity) preserving student confidentiality.#   t e s t - a p  
 