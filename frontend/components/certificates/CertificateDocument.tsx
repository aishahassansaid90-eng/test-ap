'use client';

import React from 'react';
import { Certificate } from '@/types';
import { Award, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificateDocumentProps {
  certificate: Certificate;
  allowPrint?: boolean;
}

export function CertificateDocument({ certificate, allowPrint = true }: CertificateDocumentProps) {
  let templateData: any = {};
  try {
    if (certificate.templateData) {
      templateData = JSON.parse(certificate.templateData);
    }
  } catch (e) {
    // fallback
  }

  const studentName = templateData.studentName || certificate.student?.fullName || 'Student Name';
  const studentNumber = templateData.studentNumber || certificate.student?.studentNumber || 'STU-XXXX';
  const courseTitle = templateData.courseTitle || certificate.course?.title || 'Professional Training Course';
  const courseCode = templateData.courseCode || certificate.course?.courseCode || 'CRS-101';
  const duration = templateData.duration || certificate.course?.duration || '120 Hours';
  const instructor = templateData.instructor || certificate.course?.instructor || 'Faculty Lead';
  const grade = templateData.grade || 'Pass with Distinction';
  const issueDateFormatted = new Date(certificate.issueDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {allowPrint && (
        <div className="flex items-center gap-3 self-end print:hidden">
          <Button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Printer className="w-4 h-4" />
            Print / Save Certificate as PDF
          </Button>
        </div>
      )}

      {/* Certificate Frame */}
      <div className="relative w-full max-w-4xl bg-white p-10 md:p-14 shadow-2xl rounded-2xl border-[12px] border-double border-slate-800 text-center select-none print:shadow-none print:border-black print:m-0 print:p-8">
        {/* Subtle Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Award className="w-96 h-96 text-slate-900" />
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-900 text-amber-400 shadow-md mb-4 print:border print:border-black">
            <Award className="h-10 w-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-wider text-slate-900">
            Bakka Training Center
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 mt-1 font-semibold">
            Center of Excellence in Professional & Technical Education
          </p>
        </div>

        <div className="my-8 border-b-2 border-amber-600/40 w-3/4 mx-auto" />

        {/* Certificate Title */}
        <div className="relative z-10 mb-6">
          <h2 className="text-xl md:text-2xl font-serif italic text-slate-700">
            Certificate of Completion
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-light">
            This is to officially certify that
          </p>
          <div className="my-4">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-blue-950 underline decoration-amber-500 decoration-2 underline-offset-8">
              {studentName}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-3">
              Student ID: {studentNumber}
            </p>
          </div>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mt-4">
            has successfully completed all prescribed coursework, practical laboratory requirements, and examinations for the professional training program in
          </p>
          <div className="my-4">
            <h4 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
              {courseTitle}
            </h4>
            <p className="text-sm font-medium text-blue-700 mt-1">
              Course Code: {courseCode} &bull; Duration: {duration}
            </p>
          </div>
          <div className="inline-block rounded-full bg-amber-50 border border-amber-200 px-4 py-1 text-xs font-semibold text-amber-900">
            Honors: {grade}
          </div>
        </div>

        {/* Footer Signatures and Verification Seal */}
        <div className="relative z-10 mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="text-left">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Instructor</p>
            <p className="text-sm font-bold text-slate-800 border-b border-slate-400 pb-1 mt-1 font-serif">
              {instructor}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Academic Faculty Lead</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-double border-amber-600 bg-amber-50 text-amber-800 shadow-inner">
              <ShieldCheck className="h-8 w-8 text-amber-700" />
            </div>
            <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest mt-1">Official Seal</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Cert #{certificate.certificateNumber}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Date of Issuance</p>
            <p className="text-sm font-bold text-slate-800 border-b border-slate-400 pb-1 mt-1 font-serif">
              {issueDateFormatted}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Director of Academic Affairs</p>
          </div>
        </div>

        {/* Verification Link Notice */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Bakka Training Center &bull; Verified Academic Credential</span>
          <span className="font-mono text-blue-600">
            Verify: /verify-certificate/{certificate.certificateNumber}
          </span>
        </div>
      </div>
    </div>
  );
}
