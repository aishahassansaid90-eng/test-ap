export type Role = 'ADMIN' | 'STAFF' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'SUSPENDED';
export type StaffStatus = 'ACTIVE' | 'INACTIVE';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'DROPPED';
export type CertificateStatus = 'VALID' | 'REVOKED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  studentProfile?: Student | null;
  staffProfile?: Staff | null;
}

export interface Student {
  id: string;
  userId?: string | null;
  studentNumber: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
  enrollments?: Enrollment[];
  certificates?: Certificate[];
  _count?: {
    enrollments: number;
    certificates: number;
  };
}

export interface Staff {
  id: string;
  userId: string;
  staffNumber: string;
  jobTitle: string;
  department?: string | null;
  status: StaffStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Course {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  duration: string;
  schedule: string;
  fee: number | string;
  capacity: number;
  instructor: string;
  status: CourseStatus;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  activeEnrollments?: number;
  remainingCapacity?: number;
  isFull?: boolean;
  createdBy?: {
    id: string;
    fullName: string;
    role: Role;
  };
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  enrolledAt: string;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  course?: Course;
  reviewedBy?: {
    id: string;
    fullName: string;
    role: Role;
  } | null;
  certificate?: Certificate | null;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  studentId: string;
  courseId: string;
  enrollmentId: string;
  issueDate: string;
  issuedById: string;
  status: CertificateStatus;
  templateData?: string | null;
  filePath?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  course?: Course;
  issuedBy?: {
    id: string;
    fullName: string;
    role: Role;
  };
}

export interface AuditLog {
  id: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actorUser?: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
  } | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  errors?: Array<{ field: string; message: string }>;
}
