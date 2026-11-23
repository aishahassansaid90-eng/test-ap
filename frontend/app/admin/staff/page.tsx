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
import { Staff, ApiResponse } from '@/types';
import { Search, PlusCircle, Edit3, UserX, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: 'Academic Affairs',
    password: '',
    status: 'ACTIVE'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await apiClient<ApiResponse<Staff[]>>('/staff', {
        params: { page, limit: 10, search, status: statusFilter }
      });
      setStaffList(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStaff();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await apiClient('/staff', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setFormSuccess('Staff account created successfully!');
      setTimeout(() => {
        setCreateModalOpen(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          jobTitle: '',
          department: 'Academic Affairs',
          password: '',
          status: 'ACTIVE'
        });
        fetchStaff();
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Staff creation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setFormData({
      fullName: staff.user?.fullName || '',
      email: staff.user?.email || '',
      phone: staff.user?.phone || '',
      jobTitle: staff.jobTitle,
      department: staff.department || '',
      password: '',
      status: staff.status
    });
    setEditModalOpen(true);
    setFormError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setFormLoading(true);
    setFormError(null);

    try {
      await apiClient(`/staff/${selectedStaff.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          department: formData.department,
          status: formData.status
        })
      });
      setEditModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update staff');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (staff: Staff) => {
    if (!confirm(`Are you sure you want to deactivate ${staff.user?.fullName}?`)) return;
    try {
      await apiClient(`/staff/${staff.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'INACTIVE' })
      });
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate staff');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Accounts Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin-only management of instructors, coordinators, and academic staff
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} className="bg-amber-600 hover:bg-amber-700">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Add Staff Member
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search staff name, job title, #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Button type="submit" size="sm">Search</Button>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : staffList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No staff accounts found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-mono font-bold text-xs text-amber-700">
                      {staff.staffNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">{staff.user?.fullName}</TableCell>
                    <TableCell className="text-xs text-slate-700">{staff.jobTitle}</TableCell>
                    <TableCell className="text-xs text-slate-500">{staff.department || '—'}</TableCell>
                    <TableCell className="text-xs text-slate-600">{staff.user?.email}</TableCell>
                    <TableCell>
                      <Badge variant={staff.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(staff)}
                        className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {staff.status === 'ACTIVE' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeactivate(staff)}
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

      {/* Create Staff Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Staff Member"
        description="Creates staff profile and login account with auto-generated staff number."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
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
                placeholder="e.g. Dr. Maryan Yusuf"
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
                placeholder="staff@bakka.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Job Title *</label>
              <Input
                required
                placeholder="e.g. Senior Instructor"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Department</label>
              <Input
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                placeholder="Default: Staff@123456"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading} className="bg-amber-600 hover:bg-amber-700">
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Staff Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Staff Member"
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
              <label className="font-semibold text-slate-700">Job Title</label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
              </select>
            </div>
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
