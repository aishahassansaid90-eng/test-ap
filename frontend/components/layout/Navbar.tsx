'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'STAFF':
        return 'warning';
      case 'STUDENT':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur transition-all">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-blue-600">Bakka</span> Training Center
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-900">{user.fullName}</span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {user.role}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
