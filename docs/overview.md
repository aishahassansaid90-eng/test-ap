# Bakka Training Center Administration System
## 1. Project Overview
Build a secure, responsive, web-based administration system for **Bakka Training Center**. The system manages administrators, staff, students, courses, student enrollments, and certificates. Each account must see only the pages, records, and actions permitted by its role.

## 2. Main Goals
- Centralize student, course, enrollment, and certificate records.
- Make student registration and course enrollment straightforward.
- Give administrators, staff, and students separate dashboards.
- Protect personal and academic information through authentication and role-based access control.
- Provide searchable records and useful operational reports.
- Work well on desktop, tablet, and mobile screens.

## 3. User Roles and Permissions
### Administrator
- Access the administration dashboard.
- Create, view, update, deactivate, and manage staff accounts.
- Manage student records and student accounts.
- Create and manage courses, categories, schedules, fees, and capacity.
- View and manage all enrollments.
- Approve or issue certificates according to center policy.
- View reports and system activity logs.
- Configure system settings and role permissions.

### Staff
- Access the staff dashboard.
- Register students and update permitted student details.
- View courses and manage enrollments when authorized.
- Record attendance and student progress if those modules are enabled.
- Prepare certificate requests; issuance/approval remains restricted to authorized users.
- View reports limited to their assigned responsibilities.
- Cannot manage administrator accounts, system settings, or permissions.

### Student
- Access only the student dashboard and own records.
- View and update permitted profile information.
- Browse available courses.
- Submit an enrollment request and view its status.
- View enrolled courses and published results/progress.
- View and download certificates issued to that student.
- Cannot view another student's personal, enrollment, or certificate information.

## 4. Core Modules
1. **Authentication and Access Control** — sign in/out, password reset, protected routes, role checks, session handling.
2. **Dashboard** — role-specific summaries, quick actions, and recent activity.
3. **Staff Management** — staff profiles, account status, and assigned responsibilities.
4. **Student Management** — registration, profile, student number, contact details, and status.
5. **Course Management** — course title, code, description, duration, schedule, fee, capacity, instructor, and status.
6. **Course Enrollment** — enrollment requests, approval/rejection, enrollment status, and enrollment history.
7. **Certificates** — certificate templates, unique certificate number, student/course association, issue date, authorized issuer, verification status, and printable/downloadable output.
8. **Reports** — student lists, course rosters, enrollment summaries, and certificate reports.
9. **Audit Log** — record important actions such as account changes, enrollment decisions, and certificate issuance.

## 5. Suggested Dashboard Content
- **Admin:** total students, active staff, active courses, pending enrollments, certificates issued, recent activity.
- **Staff:** students registered by/assigned to the staff member, pending tasks, course rosters, recent enrollments.
- **Student:** profile completion, enrolled courses, enrollment status, published progress, available certificates.

Dashboard figures must be calculated from authorized database records, not hard-coded sample values.

## 6. Main Workflows
### Student registration
1. Authorized staff or administrator opens Student Registration.
2. Enters required student details.
3. System validates required fields and checks for duplicate email/phone/student number where applicable.
4. System creates the student record and, if requested, a student login account.
5. System generates a unique student number and displays a confirmation.

### Course creation and enrollment
1. Administrator creates and publishes a course.
2. Student browses published courses and submits an enrollment request, or authorized staff records an enrollment.
3. System checks course status, capacity, and duplicate active enrollment.
4. Authorized staff/administrator approves or rejects the request.
5. Student can see the updated status.

### Certificate issuance
1. Authorized staff submits a certificate request or administrator opens an eligible completed enrollment.
2. System checks completion/approval requirements configured by the center.
3. Authorized issuer confirms the details and issues the certificate.
4. System generates a unique certificate number and stores the certificate record.
5. Student can view/download their own certificate.
6. A public verification page may verify a certificate by its unique code without exposing private student data.

## 7. Functional Requirements
- Secure login and logout.
- Role-based authorization enforced on the backend for every protected endpoint.
- Separate navigation and dashboard views for Admin, Staff, and Student.
- CRUD operations for permitted student, staff, course, and enrollment records.
- Search, filtering, sorting, and pagination for administrative lists.
- Enrollment approval workflow.
- Certificate creation, listing, printing, downloading, and verification.
- Form validation with clear success and error messages.
- Responsive and accessible user interface.
- Audit trail for sensitive administrative actions.

## 8. Non-Functional Requirements
- Security: password hashing, input validation, least-privilege access, secure cookies/tokens, rate limiting, and safe error handling.
- Privacy: students can access only their own private records.
- Reliability: database transactions for enrollment and certificate issuance.
- Performance: pagination and indexed search fields.
- Maintainability: modular frontend, backend, and database layers.
- Accessibility: keyboard-friendly controls, readable contrast, and labels for form fields.
- Backup: documented database backup and restore process.

## 9. Acceptance Criteria
- Admin, Staff, and Student accounts land on their own dashboards after login.
- Unauthorized users cannot access restricted pages by changing a URL or calling an API directly.
- Students cannot read or change another student's records.
- Staff cannot perform administrator-only operations.
- Student registration creates a valid unique student record.
- Duplicate active course enrollments are prevented.
- Enrollment status changes are recorded and visible to the correct users.
- Only authorized users can issue certificates.
- Certificate numbers are unique and certificates are linked to the correct student and course.
- The application is responsive and all navigation links lead to implemented pages.

## 10. Out of Scope Unless Approved
Online payment processing, SMS/email gateways, biometric attendance, payroll, and a public course marketplace are optional future integrations. Do not add them without explicit project approval.
