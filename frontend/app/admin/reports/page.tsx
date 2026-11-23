'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { apiClient } from '@/lib/api';
import { Course, ApiResponse } from '@/types';
import { BarChart3, Users, BookOpen, Award, ClipboardCheck, Printer, Loader2 } from 'lucide-react';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'rosters' | 'enrollments' | 'certificates'>('students');
  const [loading, setLoading] = useState(false);

  // Filter params
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Report Data
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await apiClient<ApiResponse<Course[]>>('/courses');
        setCourseList(res.data || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadCourses();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let params: any = {};

      if (activeTab === 'students') {
        endpoint = '/reports/students';
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      } else if (activeTab === 'rosters') {
        endpoint = '/reports/rosters';
        if (selectedCourseId) params.courseId = selectedCourseId;
      } else if (activeTab === 'enrollments') {
        endpoint = '/reports/enrollments';
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (selectedCourseId) params.courseId = selectedCourseId;
      } else if (activeTab === 'certificates') {
        endpoint = '/reports/certificates';
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (selectedCourseId) params.courseId = selectedCourseId;
      }

      const res = await apiClient<ApiResponse<any>>(endpoint, { params });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operational & Academic Reports</h1>
          <p className="text-xs text-slate-500 mt-1">Exportable roster lists, registration figures, and enrollment summaries</p>
        </div>

        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2 print:hidden">
          <Printer className="w-4 h-4" />
          Print / Export Report
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-sm gap-2 print:hidden">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold border-b-2 transition-colors ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Student Registrations
        </button>
        <button
          onClick={() => setActiveTab('rosters')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold border-b-2 transition-colors ${
            activeTab === 'rosters'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Course Rosters
        </button>
        <button
          onClick={() => setActiveTab('enrollments')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold border-b-2 transition-colors ${
            activeTab === 'enrollments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          Enrollment Summary
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold border-b-2 transition-colors ${
            activeTab === 'certificates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Issued Certificates
        </button>
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-200 print:hidden">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-36 h-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">To:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-36 h-8 text-xs"
              />
            </div>

            {(activeTab === 'rosters' || activeTab === 'enrollments' || activeTab === 'certificates') && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Course:</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs"
                >
                  <option value="">All Courses</option>
                  {courseList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseCode} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button size="sm" onClick={fetchReport} className="h-8 text-xs bg-slate-900">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : activeTab === 'students' ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Student Registration Report</h3>
                <p className="text-xs text-slate-500">Total Registered Learners: {reportData?.length || 0}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student #</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs font-bold text-blue-700">{s.studentNumber}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{s.fullName}</TableCell>
                      <TableCell className="text-xs text-slate-600">{s.email || '—'}</TableCell>
                      <TableCell className="text-xs text-slate-600">{s.phone || '—'}</TableCell>
                      <TableCell><Badge variant="success">{s.status}</Badge></TableCell>
                      <TableCell className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : activeTab === 'rosters' ? (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Official Course Rosters</h3>
              {reportData?.map((course: any) => (
                <div key={course.id} className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{course.courseCode} — {course.title}</span>
                      <p className="text-slate-500 mt-0.5">Instructor: {course.instructor} &bull; Capacity: {course.capacity}</p>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {course.enrollments?.length || 0} Students Enrolled
                    </Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student #</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.enrollments?.map((enr: any) => (
                        <TableRow key={enr.id}>
                          <TableCell className="font-mono text-xs font-semibold">{enr.student.studentNumber}</TableCell>
                          <TableCell className="font-medium text-slate-900">{enr.student.fullName}</TableCell>
                          <TableCell className="text-xs text-slate-600">{enr.student.email}</TableCell>
                          <TableCell className="text-xs text-slate-600">{enr.student.phone}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          ) : activeTab === 'enrollments' ? (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Enrollment Status Distribution</h3>
              <p className="text-xs text-slate-500 mb-6">Total Applications Tracked: {reportData?.total || 0}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {reportData?.byStatus?.map((item: any) => (
                  <Card key={item.status} className="border-slate-200">
                    <CardHeader className="p-4 pb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{item.status}</span>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold text-slate-900">{item._count.id}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Certificates Issued Report</h3>
              <p className="text-xs text-slate-500 mb-4">Total Credentials Granted: {reportData?.length || 0}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Authorized Issuer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.map((cert: any) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-xs font-bold text-purple-700">{cert.certificateNumber}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{cert.student.fullName}</TableCell>
                      <TableCell className="text-xs text-slate-700">{cert.course.title}</TableCell>
                      <TableCell className="text-xs text-slate-600">{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs text-slate-500">{cert.issuedBy?.fullName || 'Academic Office'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
