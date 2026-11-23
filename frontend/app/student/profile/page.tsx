'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { Student, ApiResponse } from '@/types';
import { UserCircle, Phone, MapPin, Mail, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StudentProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiClient<ApiResponse<Student>>('/students/me');
        if (res.data) {
          setStudent(res.data);
          setFormData({
            phone: res.data.phone || '',
            address: res.data.address || '',
            emergencyContactName: res.data.emergencyContactName || '',
            emergencyContactPhone: res.data.emergencyContactPhone || ''
          });
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await apiClient(`/students/${student.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Student Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage personal contact details and emergency contact records</p>
      </div>

      {/* Profile Header */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
              {student?.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{student?.fullName}</h2>
                <Badge variant="success">{student?.status}</Badge>
              </div>
              <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">
                Student Number: {student?.studentNumber}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{student?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Contact & Address Information</CardTitle>
          <CardDescription>Keep your contact info current to receive academic announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            {saveSuccess && (
              <Alert variant="success">
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>Profile updated successfully!</AlertDescription>
              </Alert>
            )}
            {saveError && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Phone Number</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+252 61 5000000"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Residential Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="District / City"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 mb-3">Emergency Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Emergency Contact Name</label>
                  <Input
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="Parent / Guardian / Spouse"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Emergency Contact Phone</label>
                  <Input
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="Emergency Phone Number"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
