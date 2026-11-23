# AI Development Prompts — Bakka Training Center

Use these prompts in order. Ask the coding agent to inspect the existing repository before changing files.

## Prompt 1 — Project Setup and Architecture
Act as a senior full-stack developer. Build the Bakka Training Center Administration System using the requirements in `overview.md`, `tech_stach.md`, and `agent_rules.md`.

Create a monorepo with:
- `frontend/`: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui.
- `backend/`: Node.js, Express, JavaScript `.js` files only.
- MySQL database with Prisma ORM and migrations.

Set up environment examples, linting, error handling, a health endpoint, and clear README instructions. Keep frontend TypeScript and backend JavaScript separate. Do not implement fake data as if it were production data. First show the proposed folder structure, then implement it.

## Prompt 2 — Database and Backend Foundation
Design the Prisma/MySQL schema for User, Student, Staff, Course, Enrollment, Certificate, and AuditLog. Add appropriate relations, unique constraints, indexes, timestamps, and migrations.

Implement a modular Express API with controllers, services, repositories where useful, validation, centralized error handling, and `/api/v1/health`. Use JavaScript `.js` files. Include a development-only seed script and explain how to migrate and seed the database.

## Prompt 3 — Authentication and Role-Based Access
Implement secure login, logout, and current-user endpoints. Support `ADMIN`, `STAFF`, and `STUDENT` roles.

Add backend authentication middleware, role middleware, and resource-level authorization. Students must only access their own records. Staff must be restricted to staff permissions. Admin-only functions must be inaccessible to Staff and Students, including through direct API requests.

Add tests proving both allowed and denied access. Do not rely only on hiding frontend links.

## Prompt 4 — Frontend Layout and Dashboards
Create a professional, responsive training-center interface using Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

Build separate layouts, sidebars, navigation menus, and dashboards for Admin, Staff, and Student. Show dashboard metrics from the API and display role-appropriate quick actions. Add loading, empty, error, and unauthorized states. Do not hard-code dashboard statistics.

## Prompt 5 — Student and Staff Management
Build student registration, student list, student detail, edit, status management, search, filters, and pagination. Generate a unique student number on the backend.

Build Admin-only staff creation, listing, editing, and deactivation. Validate all inputs on the backend and show clear form errors on the frontend. Preserve historical enrollments when a student or staff account is deactivated.

## Prompt 6 — Course Management
Build Admin course creation, editing, publishing, archiving, and listing. Include course code, title, description, duration, schedule, fee, capacity, instructor, and status.

Students and Staff may view only courses permitted by their role. Validate course capacity and status on the backend. Add search, filters, pagination, and responsive course detail pages.

## Prompt 7 — Enrollment Workflow
Allow Students to browse published courses and submit enrollment requests. Allow authorized Staff/Admin users to review and approve or reject requests.

Prevent duplicate active enrollments. Check course availability and capacity on the backend. Record reviewer, review time, and status history. Ensure Students can view only their own enrollment records and status.

## Prompt 8 — Certificates
Implement a certificate workflow. Check that the related enrollment meets the configured completion requirements before issuance. Restrict issuance to authorized users.

Generate a unique certificate number, store the student/course/issuer/issue-date relationships, and provide a printable/downloadable certificate. Add a certificate verification page that reveals only the minimum information needed to confirm validity. Students must see only their own certificates.

## Prompt 9 — Reports and Audit Logs
Create role-limited reports for student registrations, course rosters, enrollments, and issued certificates. Add filters and date ranges. Admins can view system audit events; Staff can view only events relevant to their permitted work. Do not expose sensitive secrets or unnecessary personal data in logs.

## Prompt 10 — Testing and Final Quality Review
Review the entire application against the documentation. Test login/logout, role-specific dashboards, direct URL access, direct API access, student data isolation, staff restrictions, enrollment capacity and duplicate checks, and certificate issuance permissions.

Fix all broken navigation, nonfunctional buttons, validation problems, responsive layout issues, and console/server errors. Run lint, frontend type-check, backend tests, and database migration checks. Update README with exact setup and run commands. Report any incomplete feature honestly.

## Final Instruction to the Coding Agent
Do not stop after creating a visual mockup. Deliver a connected full-stack application with working frontend, backend, database schema, migrations, authentication, authorization, and core workflows. Follow the four documentation files as the source of truth. If a requirement is ambiguous, document the assumption rather than inventing a risky business rule.
