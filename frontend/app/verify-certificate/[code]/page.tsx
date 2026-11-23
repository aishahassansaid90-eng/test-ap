'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ArrowLeft, Loader2, Award } from 'lucide-react';

interface VerificationResult {
  isValid: boolean;
  status?: string;
  certificateNumber?: string;
  studentName?: string;
  studentNumber?: string;
  courseCode?: string;
  courseTitle?: string;
  duration?: string;
  issueDate?: string;
  institution?: string;
  message?: string;
}

export default function CertificateVerificationDetailPage() {
  const params = useParams();
  const code = params.code as string;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    async function verify() {
      if (!code) return;
      try {
        const res = await apiClient<ApiResponse<VerificationResult>>(`/certificates/verify/${code}`);
        setResult(res.data);
      } catch (err: any) {
        setResult({
          isValid: false,
          message: err.message || 'Verification failed. Invalid certificate number.'
        });
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [code]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <Link href="/verify-certificate" className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 mb-4">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Verification Search
          </Link>

          {loading ? (
            <Card className="p-12 text-center shadow-md">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">Querying registry database...</p>
            </Card>
          ) : result?.isValid ? (
            <Card className="shadow-xl border-emerald-200 overflow-hidden">
              <div className="bg-emerald-600 p-6 text-white text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20 mb-2">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold">Authentic Verified Certificate</h2>
                <p className="text-xs text-emerald-100 mt-1 font-mono">
                  Certificate #{result.certificateNumber}
                </p>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Student Name</span>
                    <p className="font-bold text-slate-900 text-base">{result.studentName}</p>
                    <p className="text-xs text-slate-500 font-mono">ID: {result.studentNumber}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Issuing Institution</span>
                    <p className="font-bold text-slate-900">{result.institution}</p>
                    <Badge variant="success" className="mt-1">Active & Valid</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Program Completed</span>
                    <p className="font-bold text-slate-900 text-base">{result.courseTitle}</p>
                    <p className="text-xs text-slate-500">
                      Code: {result.courseCode} &bull; Duration: {result.duration}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Date of Issuance</span>
                    <p className="font-medium text-slate-800">
                      {result.issueDate ? new Date(result.issueDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900 border border-blue-100 mt-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>This credential was issued and validated by Bakka Training Center.</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-red-200">
              <div className="bg-red-50 p-6 text-center border-b border-red-100">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-red-900">Certificate Not Found</h2>
                <p className="text-xs text-red-700 mt-1">
                  The certificate number <span className="font-mono font-semibold">{code}</span> was not found in our verified database.
                </p>
              </div>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-slate-600 mb-6">
                  Please verify the number or contact Bakka Training Center Academic Affairs.
                </p>
                <Link href="/verify-certificate">
                  <Button variant="outline" className="w-full">Try Another Code</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
