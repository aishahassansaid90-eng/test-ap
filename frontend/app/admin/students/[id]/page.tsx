'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { apiClient } from '@/lib/api';
import { Student, ApiResponse } from '@/types';
import { ArrowLeft, UserCircle, Calendar, Phone, Mail, MapPin, Award, BookOpen, Loader2 } from 'lucide-react';

export default function AdminStudentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      try {
        const res = await apiClient<ApiResponse<Student>>(`/students/${id}`);
        setStudent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Student record not found</p>
        <Link href="/admin/students" className="mt-4 inline-block">
          <Button variant="outline">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/students" className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Student Directory
      </Link>

      {/* Header Profile Card */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
                {student.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{student.fullName}</h1>
                  <Badge variant={student.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {student.status}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-blue-700 font-semibold mt-0.5">
                  ID: {student.studentNumber}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-600 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{student.email || 'No email registered'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{student.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{student.address || 'Address unlisted'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Personal Info & Emergency Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Gender</span>
              <span className="font-semibold text-slate-800">{student.gender || 'Not specified'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Date of Birth</span>
              <span className="font-semibold text-slate-800">
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Account Registered</span>
              <span className="font-semibold text-slate-800">
                {new Date(student.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Emergency Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Contact Person</span>
              <span className="font-semibold text-slate-800">
                {student.emergencyContactName || 'None recorded'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Emergency Phone</span>
              <span className="font-semibold text-slate-800">
                {student.emergencyContactPhone || 'None recorded'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Enrollments History */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Course Enrollment History ({student.enrollments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!student.enrollments || student.enrollments.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No course enrollments on file.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Enrolled At</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.enrollments.map((enr) => (
                  <TableRow key={enr.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{enr.course?.title}</div>
                      <div className="font-mono text-xs text-blue-700">{enr.course?.courseCode}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{enr.course?.instructor}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {new Date(enr.enrolledAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">
                      {enr.progressPercent}%
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
                    <TableCell className="text-xs text-slate-500">
                      {enr.reviewedBy ? enr.reviewedBy.fullName : '—'}
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
