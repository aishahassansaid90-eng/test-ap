'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { CertificateDocument } from '@/components/certificates/CertificateDocument';
import { apiClient } from '@/lib/api';
import { Certificate, ApiResponse } from '@/types';
import { Eye, Loader2 } from 'lucide-react';

export default function StaffCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  useEffect(() => {
    async function fetchCerts() {
      try {
        const res = await apiClient<ApiResponse<Certificate[]>>('/certificates');
        setCertificates(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCerts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Certificates</h1>
        <p className="text-xs text-slate-500 mt-1">View official certificates issued to training center students</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No certificates recorded.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cert #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono font-bold text-xs text-purple-700">
                      {cert.certificateNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">{cert.student?.fullName}</TableCell>
                    <TableCell className="text-xs text-slate-700">{cert.course?.title}</TableCell>
                    <TableCell className="text-xs text-slate-600">{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="success">{cert.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewCert(cert)}
                        className="text-xs h-8"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {previewCert && (
        <Modal
          isOpen={Boolean(previewCert)}
          onClose={() => setPreviewCert(null)}
          title="Certificate Document"
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
