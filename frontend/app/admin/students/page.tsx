'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { Student, ApiResponse } from '@/types';
import { Search, PlusCircle, Eye, Edit3, UserX, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    status: 'ACTIVE'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await apiClient<ApiResponse<Student[]>>('/students', {
        params: { page, limit: 10, search, status: statusFilter }
      });
      setStudents(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await apiClient('/students', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setFormSuccess('Student registered successfully!');
      setTimeout(() => {
        setRegisterModalOpen(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          dateOfBirth: '',
          gender: 'Male',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          status: 'ACTIVE'
        });
        fetchStudents();
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      fullName: student.fullName,
      email: student.email || '',
      phone: student.phone || '',
      password: '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      gender: student.gender || 'Male',
      address: student.address || '',
      emergencyContactName: student.emergencyContactName || '',
      emergencyContactPhone: student.emergencyContactPhone || '',
      status: student.status
    });
    setEditModalOpen(true);
    setFormError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setFormLoading(true);
    setFormError(null);

    try {
      await apiClient(`/students/${selectedStudent.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender,
          address: formData.address,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          status: formData.status
        })
      });
      setEditModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (student: Student) => {
    if (!confirm(`Are you sure you want to deactivate ${student.fullName}? Historical records will be retained.`)) {
      return;
    }
    try {
      await apiClient(`/students/${student.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'SUSPENDED' })
      });
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate student');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Directory & Registration</h1>
          <p className="text-xs text-slate-500 mt-1">Manage student profiles, accounts, and contact records</p>
        </div>

        <Button onClick={() => setRegisterModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Register Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name, student #, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Button type="submit" size="sm">Search</Button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="COMPLETED">Completed</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No students found matching your criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student #</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono font-bold text-xs text-blue-700">
                      {student.studentNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">{student.fullName}</TableCell>
                    <TableCell className="text-xs text-slate-600">{student.email || '—'}</TableCell>
                    <TableCell className="text-xs text-slate-600">{student.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === 'ACTIVE' ? 'success' :
                          student.status === 'SUSPENDED' ? 'destructive' : 'secondary'
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {student._count?.enrollments || 0} courses
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Link href={`/admin/students/${student.id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(student)}
                        className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {student.status === 'ACTIVE' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeactivate(student)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                        >
                          <UserX className="h-4 w-4" />
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

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing {students.length} of {total} students</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page * 10 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Register Student Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Register New Student"
        description="Creates student record and user account with auto-generated student number."
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {formSuccess && (
            <Alert variant="success">
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription>{formSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Full Name *</label>
              <Input
                required
                placeholder="e.g. Fatima Ali"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Email Address *</label>
              <Input
                type="email"
                required
                placeholder="e.g. fatima@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Phone Number</label>
              <Input
                placeholder="+252 61 5000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Initial Password</label>
              <Input
                type="password"
                placeholder="Leave blank for Student@123456"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Date of Birth</label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="mt-1 flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-xs"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-slate-700">Home Address</label>
            <Input
              placeholder="District / City"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Emergency Contact Name</label>
              <Input
                placeholder="Guardian / Relative"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Emergency Contact Phone</label>
              <Input
                placeholder="Phone number"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading} className="bg-blue-600 hover:bg-blue-700">
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Student Profile"
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
              <label className="font-semibold text-slate-700">Full Name</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="COMPLETED">Completed</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Email</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-slate-700">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading} className="bg-blue-600 hover:bg-blue-700">
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
