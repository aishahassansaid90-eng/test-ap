'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CertificateDocument } from '@/components/certificates/CertificateDocument';
import { apiClient } from '@/lib/api';
import { Certificate, Enrollment, ApiResponse } from '@/types';
import { Award, PlusCircle, Search, Eye, ExternalLink, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Issue Certificate Modal
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [completedEnrollments, setCompletedEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  const [grade, setGrade] = useState('Pass with Distinction (A+)');
  const [honors, setHonors] = useState('Official Academic Honors');
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  // Preview Modal
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await apiClient<ApiResponse<Certificate[]>>('/certificates', {
        params: { page, limit: 10, search }
      });
      setCertificates(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleEnrollments = async () => {
    try {
      const res = await apiClient<ApiResponse<Enrollment[]>>('/enrollments', {
        params: { status: 'COMPLETED', limit: 50 }
      });
      // Filter out enrollments that already have certificates
      const eligible = (res.data || []).filter((e) => !e.certificate);
      setCompletedEnrollments(eligible);
      if (eligible.length > 0) {
        setSelectedEnrollmentId(eligible[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [page]);

  const openIssueModal = () => {
    fetchEligibleEnrollments();
    setIssueError(null);
    setIssueModalOpen(true);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollmentId) {
      setIssueError('Please select an eligible completed student enrollment');
      return;
    }

    setIssueLoading(true);
    setIssueError(null);

    try {
      await apiClient('/certificates', {
        method: 'POST',
        body: JSON.stringify({
          enrollmentId: selectedEnrollmentId,
          grade,
          honors
        })
      });
      setIssueModalOpen(false);
      fetchCertificates();
    } catch (err: any) {
      setIssueError(err.message || 'Failed to issue certificate');
    } finally {
      setIssueLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Digital Certificate Issuance & Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Issue official credentials for completed training courses</p>
        </div>

        <Button onClick={openIssueModal} className="bg-purple-600 hover:bg-purple-700">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Issue Certificate
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search certificate #, student, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <span className="text-xs text-slate-400">Total Issued: {total}</span>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No certificates issued yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cert #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Issued By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono font-bold text-xs text-purple-700">
                      {cert.certificateNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {cert.student?.fullName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {cert.course?.title}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {cert.issuedBy?.fullName || 'Academic Office'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cert.status === 'VALID' ? 'success' : 'destructive'}>
                        {cert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewCert(cert)}
                        className="text-xs h-8 text-purple-700 border-purple-200 hover:bg-purple-50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview & Print
                      </Button>
                      <Link href={`/verify-certificate/${cert.certificateNumber}`} target="_blank">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-slate-800">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Issue Certificate Modal */}
      <Modal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title="Issue Official Academic Certificate"
        description="Verify completion and grant an official authenticated digital credential."
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          {issueError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{issueError}</AlertDescription>
            </Alert>
          )}

          {completedEnrollments.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              No completed student enrollments pending certificate issuance at this time.
            </div>
          ) : (
            <>
              <div className="text-xs">
                <label className="font-semibold text-slate-700">Select Completed Student Enrollment *</label>
                <select
                  value={selectedEnrollmentId}
                  onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-xs"
                >
                  {completedEnrollments.map((enr) => (
                    <option key={enr.id} value={enr.id}>
                      {enr.student?.fullName} ({enr.student?.studentNumber}) — {enr.course?.courseCode} {enr.course?.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Academic Grade / Standing</label>
                  <Input
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Honors Notation</label>
                  <Input
                    value={honors}
                    onChange={(e) => setHonors(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={issueLoading || completedEnrollments.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {issueLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate & Issue Certificate'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Certificate Preview Modal */}
      {previewCert && (
        <Modal
          isOpen={Boolean(previewCert)}
          onClose={() => setPreviewCert(null)}
          title="Official Certificate Preview"
          maxWidth="max-w-4xl"
        >
          <div className="py-2">
            <CertificateDocument certificate={previewCert} allowPrint={true} />
          </div>
        </Modal>
      )}
    </div>
  );
}
