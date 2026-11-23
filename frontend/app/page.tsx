'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  GraduationCap,
  Award,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Clock,
  UserCheck,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await apiClient<ApiResponse<Course[]>>('/courses', {
          params: { limit: 3, status: 'PUBLISHED' }
        });
        setCourses(res.data || []);
      } catch (err) {
        console.error('Failed to fetch published courses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/admin';
      case 'STAFF': return '/staff';
      case 'STUDENT': return '/student';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 to-indigo-950 py-20 px-6 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 mb-4 px-3 py-1">
            Empowering Next-Generation Professionals
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Bakka Training Center <br />
            <span className="text-blue-400">Administration & Learning Portal</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            A centralized platform for student registration, professional training courses, enrollment workflows, and tamper-proof digital certificate verification.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={getDashboardLink()}>
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 px-8">
                {user ? 'Enter My Portal' : 'Access Portal'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="border-blue-300/40 text-blue-100 hover:bg-blue-900/50 hover:text-white">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Course Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Certificate Verification Bar */}
      <section className="bg-white border-y border-slate-200 py-6 px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Verify Credential Authenticity</h4>
              <p className="text-xs text-slate-500">Public registry verification for Bakka issued certificates</p>
            </div>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <input
              type="text"
              placeholder="e.g. BK-2026-001099"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="h-9 rounded-md border border-slate-300 px-3 text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Link href={verifyCode ? `/verify-certificate/${verifyCode.trim()}` : '/verify-certificate'}>
              <Button size="sm" className="whitespace-nowrap bg-slate-900 hover:bg-slate-800">
                <Search className="w-3.5 h-3.5 mr-1" />
                Verify
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Core Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Role-Based Training Management</h2>
          <p className="text-sm text-slate-500 mt-2">
            Strict isolation and authorization guarantees for administration, staff, and learners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                <GraduationCap className="h-6 w-6" />
              </div>
              <CardTitle>Learner Dashboard</CardTitle>
              <CardDescription>
                Students browse published courses, submit enrollment applications, track syllabus progress, and download official certificates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                <UserCheck className="h-6 w-6" />
              </div>
              <CardTitle>Staff Portal</CardTitle>
              <CardDescription>
                Academic coordinators register students, review applications, track course rosters, and prepare certificate approvals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                <Award className="h-6 w-6" />
              </div>
              <CardTitle>Executive Administration</CardTitle>
              <CardDescription>
                Complete authority over staff accounts, course creation, capacity limits, audit log tracking, operational reports, and certificate issuance.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Featured Courses Spotlight */}
      <section className="bg-slate-100/70 border-t border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Training Programs</h2>
              <p className="text-sm text-slate-500 mt-1">High-impact technical courses led by industry experts</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm">
                View All Courses
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col justify-between hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-mono text-xs font-bold text-blue-700 border-blue-200 bg-blue-50">
                      {course.courseCode}
                    </Badge>
                    <span className="text-lg font-bold text-slate-900">${Number(course.fee).toFixed(2)}</span>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span>Instructor: {course.instructor}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-medium text-slate-700">
                      {course.remainingCapacity !== undefined ? `${course.remainingCapacity} seats left` : 'Open'}
                    </span>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" variant="secondary" className="text-xs">
                        Details & Apply
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Bakka Training Center. All rights reserved. Built with Next.js, Node.js & MySQL.</p>
        <p className="mt-1 text-slate-400">Strict Role-Based Access Control: Admin, Staff, Student</p>
      </footer>
    </div>
  );
}
