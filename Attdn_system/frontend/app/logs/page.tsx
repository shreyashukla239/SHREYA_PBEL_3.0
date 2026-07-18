'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAttendanceLogs, AttendanceLogEntry } from '../lib/apiClient';
export default function LogsPage(): React.JSX.Element {
  const [logs, setLogs] = useState<AttendanceLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const loadLogs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchAttendanceLogs();
      if (res.status === 'success') {
        setLogs(res.logs);
      } else {
        setErrorMsg('Invalid log format response.');
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to connect to the backend server.'
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadLogs();
  }, []);
  const formatTimestamp = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return isoStr;
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    } catch {
      return isoStr;
    }
  };
  const handleExportCSV = () => {
    const headers = 'Timestamp,Student_ID,Display_Name,Subject,Status\n';
    const rows = filteredLogs
      .map(
        (log) =>
          `"${log.timestamp}","${log.student_id}","${log.display_name}","${log.subject ?? 'General'}","${log.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const filteredLogs = logs.filter((log) =>
    log.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.subject && log.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-4xl w-full mx-auto shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Attendance Logs</h1>
            <p className="text-slate-500 text-xs mt-1">View and export student check-in history records</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadLogs}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              🔄 Refresh
            </button>
            <button
              type="button"
              disabled={filteredLogs.length === 0}
              onClick={handleExportCSV}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by student name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-semibold text-slate-800"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            🔍
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-slate-500 font-medium text-xs">Loading logs...</span>
          </div>
        ) : errorMsg ? (
          <div className="bg-rose-50 border border-rose-250 rounded-xl p-6 text-center flex flex-col items-center gap-3">
            <span className="font-bold text-rose-950 text-sm">Log Load Failure</span>
            <p className="text-rose-700 text-xs">{errorMsg}</p>
            <button
              type="button"
              onClick={loadLogs}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-1.5 px-4 rounded-xl cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="border border-slate-200 border-dashed rounded-xl p-12 text-center flex flex-col items-center gap-2">
            <span className="text-2xl">📭</span>
            <h3 className="font-bold text-slate-700 text-sm">No logs found</h3>
            <p className="text-slate-400 text-xs">
              {searchTerm ? "No entries match your search query." : "No check-ins have been recorded yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Avatar</th>
                  <th className="py-3 px-5">Student Name</th>
                  <th className="py-3 px-5">Subject / Class</th>
                  <th className="py-3 px-5">Check-in Time</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
                        {log.display_name.charAt(0)}
                      </div>
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-800">
                      {log.display_name}
                    </td>
                    <td className="py-3 px-5 text-slate-650 font-medium">
                      {log.subject ?? 'General'}
                    </td>
                    <td className="py-3 px-5 text-slate-500">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="py-3 px-5">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-end mt-2">
          <Link
            href="/"
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-2 px-5 rounded-xl transition-colors cursor-pointer text-center"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
