'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { Course, ApiResponse } from '@/types';
import { Search, Clock, Users, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCourses = async (q = '') => {
    setLoading(true);
    try {
      const res = await apiClient<ApiResponse<Course[]>>('/courses', {
        params: { search: q, status: 'PUBLISHED' }
      });
      setCourses(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleApply = async (courseId: string) => {
    setEnrollingId(courseId);
    setMessage(null);

    try {
      await apiClient('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId })
      });
      setMessage({
        type: 'success',
        text: 'Enrollment application submitted! Coordinators will review your request.'
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to submit enrollment application'
      });
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Available Courses</h1>
          <p className="text-xs text-slate-500 mt-1">Explore published programs and apply for enrollment</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchCourses(search); }} className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search course title or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'destructive'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          No courses currently available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="font-mono text-xs font-bold text-blue-700 bg-blue-50">
                    {course.courseCode}
                  </Badge>
                  <span className="text-lg font-bold text-slate-900">${Number(course.fee).toFixed(2)}</span>
                </div>
                <CardTitle className="text-base">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs mt-1">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Duration: {course.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>
                    Remaining Seats: {course.remainingCapacity ?? 0}
                    {course.isFull && <span className="text-red-600 font-bold ml-1">(FULL)</span>}
                  </span>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-medium text-slate-700">{course.instructor}</span>
                  <Button
                    size="sm"
                    disabled={enrollingId === course.id || course.isFull}
                    onClick={() => handleApply(course.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {enrollingId === course.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : course.isFull ? (
                      'Full'
                    ) : (
                      'Apply Now'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
