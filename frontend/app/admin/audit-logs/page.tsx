'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { AuditLog, ApiResponse } from '@/types';
import { ShieldAlert, Eye, Loader2 } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient<ApiResponse<AuditLog[]>>('/audit-logs', {
        params: { page, limit: 15, entityType: entityFilter }
      });
      setLogs(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entityFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security & Operational Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system event tracking for logins, account changes, enrollments, and certificate issuance
          </p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Filter Entity:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-300 bg-white px-3 text-xs"
            >
              <option value="ALL">All Entities</option>
              <option value="USER">User</option>
              <option value="STUDENT">Student</option>
              <option value="STAFF">Staff</option>
              <option value="COURSE">Course</option>
              <option value="ENROLLMENT">Enrollment</option>
              <option value="CERTIFICATE">Certificate</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>
          <span className="text-slate-400">Total Events: {total}</span>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No audit records found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-mono text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-slate-900">{log.actorUser?.fullName || 'SYSTEM'}</div>
                      <div className="text-[11px] text-slate-400">{log.actorUser?.role || 'SYSTEM'}</div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-blue-700">
                      {log.entityType} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ''}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedLog(log)}
                        className="text-xs h-7 text-blue-600"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title="Audit Event Details"
        >
          <div className="space-y-3 text-xs">
            <div className="rounded bg-slate-50 p-3 space-y-1 font-mono border border-slate-200">
              <p><span className="font-bold text-slate-700">Action:</span> {selectedLog.action}</p>
              <p><span className="font-bold text-slate-700">Actor:</span> {selectedLog.actorUser?.fullName} ({selectedLog.actorUser?.email})</p>
              <p><span className="font-bold text-slate-700">Role:</span> {selectedLog.actorUser?.role}</p>
              <p><span className="font-bold text-slate-700">Entity:</span> {selectedLog.entityType} ({selectedLog.entityId})</p>
              <p><span className="font-bold text-slate-700">Time:</span> {new Date(selectedLog.createdAt).toISOString()}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Payload Metadata:</p>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-md overflow-x-auto text-[11px]">
                {selectedLog.metadata
                  ? JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)
                  : 'No additional metadata'}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
