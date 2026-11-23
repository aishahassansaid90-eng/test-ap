'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { Course, ApiResponse } from '@/types';
import { Search, PlusCircle, Edit3, BookOpen, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    description: '',
    duration: '',
    schedule: '',
    fee: 400,
    capacity: 20,
    instructor: '',
    status: 'PUBLISHED'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await apiClient<ApiResponse<Course[]>>('/courses', {
        params: { page, limit: 10, search, status: statusFilter }
      });
      setCourses(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      await apiClient('/courses', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          fee: Number(formData.fee),
          capacity: Number(formData.capacity)
        })
      });
      setCreateModalOpen(false);
      setFormData({
        courseCode: '',
        title: '',
        description: '',
        duration: '',
        schedule: '',
        fee: 400,
        capacity: 20,
        instructor: '',
        status: 'PUBLISHED'
      });
      fetchCourses();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create course');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      courseCode: course.courseCode,
      title: course.title,
      description: course.description,
      duration: course.duration,
      schedule: course.schedule,
      fee: Number(course.fee),
      capacity: course.capacity,
      instructor: course.instructor,
      status: course.status
    });
    setEditModalOpen(true);
    setFormError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setFormLoading(true);
    setFormError(null);

    try {
      await apiClient(`/courses/${selectedCourse.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...formData,
          fee: Number(formData.fee),
          capacity: Number(formData.capacity)
        })
      });
      setEditModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update course');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleCourseStatus = async (course: Course, nextStatus: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT') => {
    try {
      await apiClient(`/courses/${course.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to update course status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Offerings & Curricula</h1>
          <p className="text-xs text-slate-500 mt-1">Create, publish, and manage academic courses and capacity</p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Create New Course
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search course title or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : courses.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No courses found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-mono font-bold text-xs text-blue-700">
                      {course.courseCode}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 max-w-xs truncate">
                      {course.title}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{course.instructor}</TableCell>
                    <TableCell className="text-xs text-slate-600">{course.duration}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-900">
                      ${Number(course.fee).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {course.activeEnrollments ?? 0} / {course.capacity}
                        </span>
                        {course.isFull && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">
                            FULL
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          course.status === 'PUBLISHED' ? 'success' :
                          course.status === 'DRAFT' ? 'warning' : 'secondary'
                        }
                      >
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(course)}
                        className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {course.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleCourseStatus(course, 'PUBLISHED')}
                          className="text-xs h-7 text-emerald-700 hover:bg-emerald-50"
                        >
                          Publish
                        </Button>
                      )}
                      {course.status === 'PUBLISHED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleCourseStatus(course, 'ARCHIVED')}
                          className="text-xs h-7 text-slate-500 hover:bg-slate-100"
                        >
                          Archive
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Course Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Training Course"
        description="Add a new academic course to the Bakka Training Center curriculum."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Course Code *</label>
              <Input
                required
                placeholder="e.g. WD-102"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className="mt-1 font-mono uppercase"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Course Title *</label>
              <Input
                required
                placeholder="e.g. Advanced Cybersecurity"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-slate-700">Course Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Detailed syllabus and learning outcomes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Duration *</label>
              <Input
                required
                placeholder="e.g. 10 Weeks (100 Hours)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Schedule *</label>
              <Input
                required
                placeholder="e.g. Mon / Wed 18:00 - 20:30"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Tuition Fee ($) *</label>
              <Input
                type="number"
                min="0"
                required
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Capacity (Seats) *</label>
              <Input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-xs"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-slate-700">Instructor Name *</label>
            <Input
              required
              placeholder="e.g. Eng. Abdullahi Osman"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Course"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Course Code</label>
              <Input
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className="mt-1 font-mono uppercase"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-slate-700">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Fee ($)</label>
              <Input
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Capacity</label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-xs"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Course'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
