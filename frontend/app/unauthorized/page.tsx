import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
          <ShieldX className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied (403)</h1>
        <p className="text-sm text-slate-600 mb-6">
          You do not have administrative or staff permission to access this protected area.
        </p>
        <Link href="/">
          <Button className="w-full">Return to Safety</Button>
        </Link>
      </div>
    </div>
  );
}
