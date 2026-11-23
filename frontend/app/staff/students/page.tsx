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
import { Student, ApiResponse } from '@/types';
import { Search, PlusCircle, Edit3, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StaffStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
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
    emergencyContactPhone: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await apiClient<ApiResponse<Student[]>>('/students', {
        params: { page, limit: 10, search }
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
  }, [page]);

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
          emergencyContactPhone: ''
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
      emergencyContactPhone: student.emergencyContactPhone || ''
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
          emergencyContactPhone: formData.emergencyContactPhone
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Admissions & Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Register walk-in students and manage student records</p>
        </div>

        <Button onClick={() => setRegisterModalOpen(true)} className="bg-amber-600 hover:bg-amber-700">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Register Student
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4">
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
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No students found.
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
                      <Badge variant="success">{student.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(student)}
                        className="text-xs h-8 text-slate-700 hover:bg-slate-100"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Register Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Register Student"
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

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Full Name *</label>
              <Input
                required
                placeholder="e.g. Hassan Noor"
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
                placeholder="e.g. hassan@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Phone</label>
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
                placeholder="Default: Student@123456"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
              />
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

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading} className="bg-amber-600 hover:bg-amber-700">
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Student Information"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
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
            <Button type="submit" disabled={formLoading} className="bg-amber-600 hover:bg-amber-700">
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
