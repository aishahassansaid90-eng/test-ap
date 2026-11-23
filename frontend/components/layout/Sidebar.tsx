'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  ClipboardList,
  Award,
  BarChart3,
  ShieldAlert,
  GraduationCap,
  Compass,
  FileCheck2,
  UserCircle
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  let navItems: NavItem[] = [];

  if (user.role === 'ADMIN') {
    navItems = [
      { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { title: 'Students', href: '/admin/students', icon: Users },
      { title: 'Staff Accounts', href: '/admin/staff', icon: UserCheck },
      { title: 'Courses', href: '/admin/courses', icon: BookOpen },
      { title: 'Enrollments', href: '/admin/enrollments', icon: ClipboardList },
      { title: 'Certificates', href: '/admin/certificates', icon: Award },
      { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
      { title: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
    ];
  } else if (user.role === 'STAFF') {
    navItems = [
      { title: 'Dashboard', href: '/staff', icon: LayoutDashboard },
      { title: 'Students', href: '/staff/students', icon: Users },
      { title: 'Courses', href: '/staff/courses', icon: BookOpen },
      { title: 'Enrollment Requests', href: '/staff/enrollments', icon: ClipboardList },
      { title: 'Certificates', href: '/staff/certificates', icon: Award },
      { title: 'Rosters & Reports', href: '/staff/reports', icon: BarChart3 },
    ];
  } else if (user.role === 'STUDENT') {
    navItems = [
      { title: 'My Dashboard', href: '/student', icon: LayoutDashboard },
      { title: 'My Profile', href: '/student/profile', icon: UserCircle },
      { title: 'Browse Courses', href: '/student/courses', icon: Compass },
      { title: 'My Enrollments', href: '/student/enrollments', icon: FileCheck2 },
      { title: 'My Certificates', href: '/student/certificates', icon: Award },
    ];
  }

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-slate-50/50 p-4 min-h-[calc(100vh-4rem)]">
      <div className="mb-4 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {user.role} Navigation
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-200/60 hover:text-slate-900"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200">
        <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-900 border border-blue-100">
          <div className="font-semibold mb-1 flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            Bakka Portal
          </div>
          <p className="text-blue-700">Official administration system with role-based access control.</p>
        </div>
      </div>
    </aside>
  );
}
