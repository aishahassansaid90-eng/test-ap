'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { Course, ApiResponse } from '@/types';
import { Search, Clock, Users, ArrowRight, BookOpen, Loader2 } from 'lucide-react';

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCourses = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await apiClient<ApiResponse<Course[]>>('/courses', {
        params: { search: searchQuery, status: 'PUBLISHED' }
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(search);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Training Course Catalog</h1>
            <p className="text-sm text-slate-500 mt-1">
              Explore professional certified programs offered at Bakka Training Center
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
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

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm text-slate-500">Loading course offerings...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">No Courses Found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col justify-between hover:shadow-lg transition-all border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-mono text-xs font-bold text-blue-700 border-blue-200 bg-blue-50">
                      {course.courseCode}
                    </Badge>
                    <span className="text-xl font-bold text-slate-900">${Number(course.fee).toFixed(2)}</span>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3 mt-1 leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Duration: {course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>
                      Capacity: {course.activeEnrollments ?? 0} / {course.capacity} enrolled
                      {course.isFull && <span className="text-red-600 font-bold ml-1">(FULL)</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium">Instructor: {course.instructor}</span>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        View & Apply
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
