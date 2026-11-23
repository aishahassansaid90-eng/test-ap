# AI Coding Agent Rules — Bakka Training Center

## 1. Project Identity
Build the Bakka Training Center Administration System as a usable, secure, responsive application. It manages Admin, Staff, and Student users, student registration, courses, enrollments, and certificates.

## 2. Mandatory Technology Rules
- Frontend: Next.js App Router + TypeScript (`.ts` / `.tsx`).
- UI: Tailwind CSS and shadcn/ui.
- Backend: Node.js + Express using JavaScript (`.js`) files only.
- Database: MySQL with Prisma ORM and migrations.
- Keep frontend and backend in separate folders.
- Do not introduce a second backend framework or a second database without approval.

## 3. Role and Permission Rules
- Implement exactly the three initial roles: `ADMIN`, `STAFF`, and `STUDENT`.
- Every role must have its own dashboard, navigation, and allowed actions.
- Enforce permissions in backend middleware and service/resource checks.
- Frontend route guards improve usability but are not security controls.
- Students may access only their own profile, enrollments, progress, and certificates.
- Staff may access only staff-authorized modules and records.
- Only Admin may manage staff accounts, system settings, and role permissions.
- Certificate issuance must be limited to explicitly authorized users.
- Default to deny when a permission is unclear.

## 4. Security and Privacy
- Hash passwords with bcrypt or an approved password-hashing algorithm.
- Never store or log plaintext passwords, session tokens, or secrets.
- Validate and normalize all incoming data on the backend.
- Use parameterized ORM queries; do not build SQL from untrusted strings.
- Apply rate limits to login and sensitive endpoints.
- Use secure, HTTP-only cookies for session credentials where applicable; configure SameSite and Secure appropriately.
- Protect state-changing requests against CSRF when cookie-based authentication is used.
- Configure CORS to allow only approved frontend origins.
- Do not expose stack traces, database credentials, or private student details in API responses.
- Collect only personal information required for training-center operations.

## 5. UI and UX Rules
- Use a clean, professional education/training-center design.
- Ensure responsive layouts for mobile, tablet, and desktop.
- Use a consistent sidebar/topbar layout per role.
- Include loading, empty, error, and success states.
- Use accessible labels, keyboard navigation, and clear contrast.
- Use confirmation dialogs for destructive actions.
- Include search, filters, and pagination on large tables.
- Do not leave dead buttons, fake links, placeholder pages, or nonfunctional forms.

## 6. Data and Business Rules
- Generate unique student numbers, staff numbers, course codes, and certificate numbers.
- Prevent duplicate active enrollment for the same student in the same course.
- Check course publication status and available capacity before enrollment.
- Record who reviewed an enrollment and when.
- Use database transactions for operations that modify related records.
- A certificate must reference a valid student and course, and must satisfy the center's configured completion/approval requirements.
- Record issuer and issue date for every certificate.
- Keep an audit log for sensitive administrative actions.
- Use soft deactivation for accounts where historical records must be retained.

## 7. Code Quality
- Use small, focused modules and clear naming.
- Keep API controllers thin; place business logic in services.
- Reuse validated schemas and shared UI components.
- Handle errors consistently with suitable HTTP status codes.
- Add tests for critical business rules and role boundaries.
- Run linting, type checking, and tests before considering a task complete.
- Do not silently remove existing working functionality.
- Do not invent integrations, credentials, or production data.

## 8. Required Delivery
- Working login/logout and role-specific dashboards.
- Student registration and management.
- Staff management for Admin.
- Course creation and management.
- Course enrollment and approval workflow.
- Certificate creation, download/print, and verification.
- Protected API routes and resource-level authorization.
- Database schema and migrations.
- Seed script with clearly labeled development-only demo accounts.
- `.env.example` without real secrets.
- README with setup, migration, seed, run, and test instructions.
- Responsive and tested application.

## 9. Definition of Done
A feature is complete only when:
1. Its UI is implemented and responsive.
2. Its API endpoint and validation are implemented.
3. Its authorization is tested for allowed and denied roles.
4. Its database changes have migrations.
5. Loading, empty, success, and error states are handled.
6. No unrelated existing feature is broken.
