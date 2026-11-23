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
  UserCheck,
  BookOpen,
  ClipboardList,
  Award,
  ArrowRight,
  TrendingUp,
  Activity,
  PlusCircle,
  Loader2
} from 'lucide-react';

interface AdminDashboardData {
  role: string;
  metrics: {
    totalStudents: number;
    activeStaff: number;
    activeCourses: number;
    pendingEnrollments: number;
    certificatesIssued: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
    actorUser?: { fullName: string; role: string };
  }>;
  recentEnrollments: Array<{
    id: string;
    status: string;
    enrolledAt: string;
    student: { fullName: string; studentNumber: string };
    course: { courseCode: string; title: string };
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await apiClient<ApiResponse<AdminDashboardData>>('/dashboard/metrics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const m = data?.metrics || {
    totalStudents: 0,
    activeStaff: 0,
    activeCourses: 0,
    pendingEnrollments: 0,
    certificatesIssued: 0
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Administrator Console</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time operations, metrics, and administration of Bakka Training Center
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/students">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Register Student
            </Button>
          </Link>
          <Link href="/admin/courses">
            <Button size="sm" variant="outline">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              New Course
            </Button>
          </Link>
          <Link href="/admin/enrollments">
            <Button size="sm" variant="secondary">
              Review Enrollments ({m.pendingEnrollments})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{m.totalStudents}</div>
            <p className="text-xs text-slate-400 mt-1">Registered learners</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Staff
            </CardTitle>
            <UserCheck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{m.activeStaff}</div>
            <p className="text-xs text-slate-400 mt-1">Instructors & staff</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Published Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{m.activeCourses}</div>
            <p className="text-xs text-slate-400 mt-1">Active training programs</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Requests
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{m.pendingEnrollments}</div>
            <p className="text-xs text-orange-600 font-medium mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Issued Certificates
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{m.certificatesIssued}</div>
            <p className="text-xs text-slate-400 mt-1">Verified credentials</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Recent Enrollments & System Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Enrollments */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Recent Enrollment Applications</CardTitle>
              <CardDescription>Latest student course registrations</CardDescription>
            </div>
            <Link href="/admin/enrollments">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                View All
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
              <p className="py-6 text-center text-xs text-slate-400">No enrollment applications yet</p>
            )}
          </CardContent>
        </Card>

        {/* Audit Stream */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">System Activity Audit Log</CardTitle>
              <CardDescription>Recent administrative and user actions</CardDescription>
            </div>
            <Link href="/admin/audit-logs">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                Audit Viewer
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <p className="text-slate-500 mt-1">
                      Actor: {log.actorUser?.fullName || 'System Root'} ({log.actorUser?.role || 'SYSTEM'})
                    </p>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No audit logs recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
