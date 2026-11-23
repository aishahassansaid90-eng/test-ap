'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { Enrollment, ApiResponse } from '@/types';
import { BookOpen, Loader2 } from 'lucide-react';

export default function StudentEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const res = await apiClient<ApiResponse<Enrollment[]>>('/enrollments');
        setEnrollments(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEnrollments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Course Enrollments</h1>
          <p className="text-xs text-slate-500 mt-1">Track application review decisions and learning progress</p>
        </div>
        <Link href="/student/courses">
          <Button size="sm">Browse More Courses</Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              You are not currently enrolled in any courses.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Syllabus Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Staff Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enr) => (
                  <TableRow key={enr.id}>
                    <TableCell className="font-mono text-xs font-bold text-blue-700">
                      {enr.course?.courseCode}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {enr.course?.title}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {new Date(enr.enrolledAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${enr.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{enr.progressPercent}%</span>
                      </div>
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
                    <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                      {enr.notes || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
