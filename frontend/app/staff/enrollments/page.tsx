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
import { Enrollment, ApiResponse } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function StaffEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('APPROVED');
  const [reviewProgress, setReviewProgress] = useState<number>(0);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await apiClient<ApiResponse<Enrollment[]>>('/enrollments', {
        params: { page, limit: 10, status: statusFilter }
      });
      setEnrollments(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [page, statusFilter]);

  const openReviewModal = (enr: Enrollment) => {
    setSelectedEnrollment(enr);
    setReviewStatus(enr.status === 'PENDING' ? 'APPROVED' : enr.status);
    setReviewProgress(enr.progressPercent || 0);
    setReviewNotes(enr.notes || '');
    setReviewError(null);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;
    setReviewLoading(true);
    setReviewError(null);

    try {
      await apiClient(`/enrollments/${selectedEnrollment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: reviewStatus,
          progressPercent: Number(reviewProgress),
          notes: reviewNotes
        })
      });
      setReviewModalOpen(false);
      fetchEnrollments();
    } catch (err: any) {
      setReviewError(err.message || 'Failed to update enrollment status');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Enrollment Review Queue</h1>
        <p className="text-xs text-slate-500 mt-1">Review admissions, verify class capacity, and track academic completion</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-300 bg-white px-3 text-xs"
            >
              <option value="ALL">All Applications</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved / Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <span className="text-xs text-slate-400">Total: {total}</span>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No enrollment records found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enr) => (
                  <TableRow key={enr.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{enr.student?.fullName}</div>
                      <div className="text-xs text-blue-700 font-mono">{enr.student?.studentNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{enr.course?.title}</div>
                      <div className="text-xs text-slate-500 font-mono">{enr.course?.courseCode}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {new Date(enr.enrolledAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700">{enr.progressPercent}%</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          enr.status === 'APPROVED' ? 'success' :
                          enr.status === 'PENDING' ? 'warning' :
                          enr.status === 'COMPLETED' ? 'default' : 'secondary'
                        }
                      >
                        {enr.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReviewModal(enr)}
                        className="text-xs h-8"
                      >
                        Review / Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Enrollment Decision"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          {reviewError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{reviewError}</AlertDescription>
            </Alert>
          )}

          {selectedEnrollment && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 border border-slate-200">
              <p><span className="font-semibold text-slate-700">Student:</span> {selectedEnrollment.student?.fullName}</p>
              <p><span className="font-semibold text-slate-700">Course:</span> {selectedEnrollment.course?.courseCode} - {selectedEnrollment.course?.title}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Enrollment Status</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-xs"
              >
                <option value="APPROVED">APPROVED (Active)</option>
                <option value="COMPLETED">COMPLETED (Course Finished)</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700">Progress (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={reviewProgress}
                onChange={(e) => setReviewProgress(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-slate-700">Notes</label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={reviewLoading} className="bg-amber-600 hover:bg-amber-700">
              {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Decision'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
