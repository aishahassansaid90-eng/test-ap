'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, Search } from 'lucide-react';

export default function VerifyCertificateSearchPage() {
  const [certCode, setCertCode] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (certCode.trim()) {
      router.push(`/verify-certificate/${certCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full shadow-lg border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-3">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Official Credential Verification</CardTitle>
            <CardDescription>
              Verify the authenticity of any certificate issued by Bakka Training Center.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Certificate Number</label>
                <div className="relative">
                  <Input
                    required
                    placeholder="e.g. BK-2026-001099"
                    value={certCode}
                    onChange={(e) => setCertCode(e.target.value)}
                    className="font-mono uppercase"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
                <Search className="w-4 h-4 mr-2" />
                Verify Authenticity
              </Button>
            </form>

            <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 border border-slate-200">
              <p className="font-semibold text-slate-700 mb-1">Privacy Notice</p>
              Public verification discloses only the minimum required information (Student Name, Course Title, Issue Date, and Validity Status) to preserve privacy.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
