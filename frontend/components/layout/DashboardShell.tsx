'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Role } from '@/types';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardShellProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function DashboardShell({ children, allowedRoles }: DashboardShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Verifying security session...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-lg border border-slate-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <ShieldX className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied (403)</h2>
            <p className="text-sm text-slate-600 mb-6">
              You do not have permission to view this section. Your account is assigned the role{' '}
              <span className="font-semibold text-slate-800">{user.role}</span>.
            </p>
            <Link href={user.role === 'ADMIN' ? '/admin' : user.role === 'STAFF' ? '/staff' : '/student'}>
              <Button className="w-full">Return to My Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
