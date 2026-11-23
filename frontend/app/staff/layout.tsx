import { DashboardShell } from '@/components/layout/DashboardShell';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell allowedRoles={['STAFF', 'ADMIN']}>{children}</DashboardShell>;
}
