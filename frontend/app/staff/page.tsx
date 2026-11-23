'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types';
import {
  Users,
  BookOpen,
  ClipboardList,
  ArrowRight,
  PlusCircle,
  FileCheck2,
  Loader2
} from 'lucide-react';

interface StaffDashboardData {
  role: string;
  metrics: {
    totalStudents: number;
    activeCourses: number;
    pendingEnrollments: number;
  };
  recentEnrollments: Array<{
    id: string;
    status: string;
    enrolledAt: string;
    student: { fullName: string; studentNumber: string };
    course: { courseCode: string; title: string };
  }>;
}

export default function StaffDashboardPage() {
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await apiClient<ApiResponse<StaffDashboardData>>('/dashboard/metrics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load staff metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const m = data?.metrics || {
    totalStudents: 0,
    activeCourses: 0,
    pendingEnrollments: 0
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Academic Staff Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">
            Student registrations, enrollment evaluations, and academic roster tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/staff/students">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Register Student
            </Button>
          </Link>
          <Link href="/staff/enrollments">
            <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700">
              Review Enrollments ({m.pendingEnrollments})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{m.totalStudents}</div>
            <p className="text-xs text-slate-400 mt-1">Active learners across center</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Programs
            </CardTitle>
            <BookOpen className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{m.activeCourses}</div>
            <p className="text-xs text-slate-400 mt-1">Published courses</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Applications
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{m.pendingEnrollments}</div>
            <p className="text-xs text-amber-600 font-semibold mt-1">Action required</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications & Roster Shortlinks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Recent Enrollment Applications</CardTitle>
              <CardDescription>Applications awaiting assessment and approval</CardDescription>
            </div>
            <Link href="/staff/enrollments">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                Evaluation Queue
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {data?.recentEnrollments && data.recentEnrollments.length > 0 ? (
              data.recentEnrollments.map((enr) => (
                <div key={enr.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{enr.student.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {enr.course.courseCode} &bull; {enr.course.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        enr.status === 'APPROVED' ? 'success' :
                        enr.status === 'PENDING' ? 'warning' :
                        enr.status === 'COMPLETED' ? 'default' : 'secondary'
                      }
                    >
                      {enr.status}
                    </Badge>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(enr.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No recent enrollments</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Task Navigation */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Staff Tasks</CardTitle>
            <CardDescription>Academic responsibilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/staff/students" className="block">
              <div className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                <span className="font-semibold text-sm text-slate-900 block">Register Student</span>
                <span className="text-xs text-slate-500">Add walk-in students and create login accounts</span>
              </div>
            </Link>
            <Link href="/staff/enrollments" className="block">
              <div className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                <span className="font-semibold text-sm text-slate-900 block">Evaluate Enrollments</span>
                <span className="text-xs text-slate-500">Review pending admissions & update progress</span>
              </div>
            </Link>
            <Link href="/staff/reports" className="block">
              <div className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                <span className="font-semibold text-sm text-slate-900 block">Course Rosters</span>
                <span className="text-xs text-slate-500">View active student rosters for all programs</span>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
