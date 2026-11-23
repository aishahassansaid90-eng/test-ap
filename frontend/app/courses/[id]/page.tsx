'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Course, ApiResponse } from '@/types';
import { Clock, Calendar, Users, DollarSign, UserCheck, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await apiClient<ApiResponse<Course>>(`/courses/${id}`);
        setCourse(res.data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'STUDENT') {
      setEnrollError('Only Student accounts can submit enrollment applications directly.');
      return;
    }

    setEnrolling(true);
    setEnrollError(null);

    try {
      await apiClient('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId: id })
      });
      setEnrollSuccess(true);
    } catch (err: any) {
      setEnrollError(err.message || 'Failed to submit enrollment request');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
          <Link href="/courses" className="mt-4">
            <Button variant="outline">Back to Course Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8">
        <Link href="/courses" className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Course Catalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-blue-700 border-blue-200 bg-blue-50">
                  {course.courseCode}
                </Badge>
                <Badge variant="success">Open for Enrollment</Badge>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">{course.title}</h1>
              <p className="text-sm text-slate-500 mt-1">Instructor: {course.instructor}</p>
            </div>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Program Overview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {course.description}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Schedule & Timetable</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Weekly Schedule</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{course.schedule}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Total Duration</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{course.duration}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Card */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-md sticky top-24">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <span className="text-xs font-semibold text-slate-400 uppercase">Tuition Fee</span>
                <div className="text-3xl font-extrabold text-slate-900">
                  ${Number(course.fee).toFixed(2)}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    Class Capacity
                  </span>
                  <span className="font-bold text-slate-900">{course.capacity} seats</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Remaining Seats
                  </span>
                  <span className="font-bold text-emerald-600">
                    {course.remainingCapacity ?? (course.capacity - (course.activeEnrollments || 0))} available
                  </span>
                </div>

                {enrollSuccess ? (
                  <Alert variant="success" className="mt-4">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertDescription>
                      Enrollment application submitted! Our coordinators will review your request.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {enrollError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{enrollError}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={handleApply}
                      disabled={enrolling || course.isFull}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting Application...
                        </>
                      ) : course.isFull ? (
                        'Course Full'
                      ) : user ? (
                        'Submit Enrollment Request'
                      ) : (
                        'Sign In to Apply'
                      )}
                    </Button>
                  </>
                )}

                {enrollSuccess && (
                  <Link href="/student/enrollments">
                    <Button variant="outline" className="w-full mt-2">
                      View My Enrollments
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
