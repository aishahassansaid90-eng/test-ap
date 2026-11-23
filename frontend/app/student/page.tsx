'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types';
import {
  BookOpen,
  Award,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Loader2
} from 'lucide-react';

interface StudentDashboardData {
  role: string;
  student?: {
    studentNumber: string;
    fullName: string;
  };
  metrics: {
    enrolledCoursesCount: number;
    activeEnrollmentsCount: number;
    completedCoursesCount: number;
    certificatesCount: number;
    profileCompletion: number;
  };
  recentEnrollments: Array<{
    id: string;
    status: string;
    progressPercent: number;
    enrolledAt: string;
    course: { courseCode: string; title: string; instructor: string };
    certificate?: { id: string; certificateNumber: string };
  }>;
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await apiClient<ApiResponse<StudentDashboardData>>('/dashboard/metrics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load student metrics:', err);
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
    enrolledCoursesCount: 0,
    activeEnrollmentsCount: 0,
    completedCoursesCount: 0,
    certificatesCount: 0,
    profileCompletion: 70
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-blue-100 border-white/20 mb-2">
              Student ID: {data?.student?.studentNumber || 'STU-XXXX'}
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {data?.student?.fullName || 'Student'}!
            </h1>
            <p className="text-sm text-blue-100 mt-1 max-w-xl">
              Track your course admissions, syllabus progress, and official Bakka graduation credentials.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/student/courses">
              <Button className="bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-sm">
                <Compass className="w-4 h-4 mr-2" />
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{m.enrolledCoursesCount}</div>
            <p className="text-xs text-slate-400 mt-1">Total applications submitted</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Courses
            </CardTitle>
            <Clock className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{m.activeEnrollmentsCount}</div>
            <p className="text-xs text-slate-400 mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Courses
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{m.completedCoursesCount}</div>
            <p className="text-xs text-slate-400 mt-1">Programs finished</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Certificates Earned
            </CardTitle>
            <Award className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{m.certificatesCount}</div>
            <p className="text-xs text-slate-400 mt-1">Verified diplomas</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Current Enrollments & Profile Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">My Active Courses & Applications</CardTitle>
              <CardDescription>Track application status and syllabus completion</CardDescription>
            </div>
            <Link href="/student/enrollments">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                View All
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {data?.recentEnrollments && data.recentEnrollments.length > 0 ? (
              data.recentEnrollments.map((enr) => (
                <div key={enr.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{enr.course.title}</h4>
                      <p className="text-xs text-slate-500">
                        {enr.course.courseCode} &bull; Instructor: {enr.course.instructor}
                      </p>
                    </div>
                    <Badge
                      variant={
                        enr.status === 'APPROVED' ? 'success' :
                        enr.status === 'PENDING' ? 'warning' :
                        enr.status === 'COMPLETED' ? 'default' : 'secondary'
                      }
                    >
                      {enr.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-xs pt-1">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${enr.progressPercent}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-700">{enr.progressPercent}% Completed</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                You have not enrolled in any courses yet.
                <div className="mt-3">
                  <Link href="/student/courses">
                    <Button size="sm">Browse Courses</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Progress Box */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Student Account</CardTitle>
            <CardDescription>Keep your contact details up to date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Profile Completion</span>
                <span className="text-blue-600">{m.profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${m.profileCompletion}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Completing your address and emergency contact details ensures eligibility for official certificate issuance.
            </p>

            <Link href="/student/profile" className="block pt-2">
              <Button variant="outline" className="w-full text-xs">
                Update Profile Info
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
