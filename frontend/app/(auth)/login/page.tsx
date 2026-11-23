'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-6 flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <GraduationCap className="h-7 w-7" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Bakka Training Center</h1>
        <p className="text-sm text-slate-500">Sign in to your administration or learner portal</p>
      </div>

      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  placeholder="name@bakka.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex flex-col border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            One-Click Development Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2 w-full text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@bakka.edu', 'Admin@123456')}
              className="rounded-lg border border-red-200 bg-red-50 p-2 text-center text-red-700 hover:bg-red-100 transition-colors font-medium"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('staff@bakka.edu', 'Staff@123456')}
              className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-center text-amber-700 hover:bg-amber-100 transition-colors font-medium"
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('student@bakka.edu', 'Student@123456')}
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center text-emerald-700 hover:bg-emerald-100 transition-colors font-medium"
            >
              Student
            </button>
          </div>
        </CardFooter>
      </Card>

      <p className="mt-6 text-xs text-slate-400">
        Bakka Training Center &bull; Protected by JWT & HTTP-Only Secure Sessions
      </p>
    </div>
  );
}
