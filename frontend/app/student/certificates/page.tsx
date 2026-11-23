'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { CertificateDocument } from '@/components/certificates/CertificateDocument';
import { apiClient } from '@/lib/api';
import { Certificate, ApiResponse } from '@/types';
import { Award, Eye, ExternalLink, Loader2 } from 'lucide-react';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    async function loadCerts() {
      try {
        const res = await apiClient<ApiResponse<Certificate[]>>('/certificates');
        setCertificates(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Issued Certificates</h1>
        <p className="text-xs text-slate-500 mt-1">Official verified credentials and diplomas issued upon program completion</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              You have no certificates issued yet. Complete a training program to earn your credential.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate #</TableHead>
                  <TableHead>Course Program</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono text-xs font-bold text-purple-700">
                      {cert.certificateNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {cert.course?.title}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">{cert.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCert(cert)}
                        className="text-xs h-8 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View & Print
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

      {selectedCert && (
        <Modal
          isOpen={Boolean(selectedCert)}
          onClose={() => setSelectedCert(null)}
          title="Official Certificate of Completion"
          maxWidth="max-w-4xl"
        >
          <div className="py-2">
            <CertificateDocument certificate={selectedCert} allowPrint={true} />
          </div>
        </Modal>
      )}
    </div>
  );
}
