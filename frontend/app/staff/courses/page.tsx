'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { Course, ApiResponse } from '@/types';
import { Clock, Users, BookOpen, Loader2 } from 'lucide-react';

export default function StaffCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await apiClient<ApiResponse<Course[]>>('/courses', {
          params: { status: 'PUBLISHED' }
        });
        setCourses(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Active Course Programs</h1>
        <p className="text-xs text-slate-500 mt-1">Published courses and current seat capacities</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="border-slate-200 flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="font-mono text-xs font-bold text-blue-700 bg-blue-50">
                    {course.courseCode}
                  </Badge>
                  <Badge variant="success">Published</Badge>
                </div>
                <CardTitle className="text-base">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs mt-1">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold text-slate-800">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Instructor:</span>
                  <span className="font-semibold text-slate-800">{course.instructor}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Capacity:</span>
                  <span className="font-bold text-slate-900">
                    {course.activeEnrollments ?? 0} / {course.capacity}
                    {course.isFull && <span className="text-red-600 ml-1">(FULL)</span>}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
