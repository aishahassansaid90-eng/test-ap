'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types';
import { Printer, Loader2 } from 'lucide-react';

export default function StaffReportsPage() {
  const [rosters, setRosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRosters() {
      try {
        const res = await apiClient<ApiResponse<any[]>>('/reports/rosters');
        setRosters(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRosters();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Course Rosters</h1>
          <p className="text-xs text-slate-500 mt-1">Official enrolled student rosters for active courses</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="flex items-center gap-2 print:hidden">
          <Printer className="w-4 h-4" />
          Print Rosters
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {rosters.map((course) => (
            <Card key={course.id} className="border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-200 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base text-slate-900">
                      {course.courseCode} — {course.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Instructor: {course.instructor} &bull; Schedule: {course.schedule}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {course.enrollments?.length || 0} Students Enrolled
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {(!course.enrollments || course.enrollments.length === 0) ? (
                  <p className="p-6 text-center text-xs text-slate-400">No active student enrollments for this program</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student #</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Enrolled Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.enrollments.map((enr: any) => (
                        <TableRow key={enr.id}>
                          <TableCell className="font-mono text-xs font-semibold">{enr.student.studentNumber}</TableCell>
                          <TableCell className="font-medium text-slate-900">{enr.student.fullName}</TableCell>
                          <TableCell className="text-xs text-slate-600">{enr.student.email}</TableCell>
                          <TableCell className="text-xs text-slate-600">{enr.student.phone}</TableCell>
                          <TableCell className="text-xs text-slate-500">{new Date(enr.enrolledAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
