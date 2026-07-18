'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAbsentees, sendAbsenteeAlert, AbsenteeEntry } from '../lib/apiClient';
export default function AbsenteesPage(): React.JSX.Element {
  const [absentees, setAbsentees] = useState<AbsenteeEntry[]>([]);
  const [cutoffTime, setCutoffTime] = useState<string>('09:00');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [alertingIds, setAlertingIds] = useState<Record<string, boolean>>({});
  const [sentAlertIds, setSentAlertIds] = useState<Record<string, boolean>>({});
  const loadAbsentees = async (timeVal: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchAbsentees(timeVal);
      if (res.status === 'success') {
        setAbsentees(res.absentees);
      } else {
        setErrorMsg('Invalid absentee log format.');
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to query absentees list.'
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAbsentees(cutoffTime);
  }, []);
  const handleCutoffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setCutoffTime(newVal);
    loadAbsentees(newVal);
  };
  const handleSendAlert = async (studentId: string) => {
    setAlertingIds((prev) => ({ ...prev, [studentId]: true }));
    try {
      const res = await sendAbsenteeAlert(studentId);
      if (res.status === 'success') {
        setSentAlertIds((prev) => ({ ...prev, [studentId]: true }));
        alert(res.message);
      } else {
        alert('Failed to send alert.');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Network error during simulated notification.');
    } finally {
      setAlertingIds((prev) => ({ ...prev, [studentId]: false }));
    }
  };
  const filteredAbsentees = absentees.filter((entry) =>
    entry.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-4xl w-full mx-auto shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Late & Absentee Tracker</h1>
            <p className="text-slate-500 text-xs mt-1">Configure cutoff times and identify missing students</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadAbsentees(cutoffTime)}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-700 text-sm">Attendance Cutoff Time</span>
            <span className="text-slate-500 text-xs">Students checking in after this hour will be classified as Late.</span>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="cutoff-time-input" className="text-xs font-bold text-slate-650">Cutoff Time:</label>
            <input
              id="cutoff-time-input"
              type="time"
              value={cutoffTime}
              onChange={handleCutoffChange}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-700 text-xs shadow-sm"
            />
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by student name..."
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
            <span className="text-slate-500 font-medium text-xs">Evaluating daily logs...</span>
          </div>
        ) : errorMsg ? (
          <div className="bg-rose-50 border border-rose-250 rounded-xl p-6 text-center flex flex-col items-center gap-3">
            <span className="font-bold text-rose-950 text-sm">Load Failure</span>
            <p className="text-rose-700 text-xs">{errorMsg}</p>
            <button
              type="button"
              onClick={() => loadAbsentees(cutoffTime)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-1.5 px-4 rounded-xl cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredAbsentees.length === 0 ? (
          <div className="border border-slate-200 border-dashed rounded-xl p-12 text-center flex flex-col items-center gap-2">
            <span className="text-2xl">🎉</span>
            <h3 className="font-bold text-slate-700 text-sm">All students accounted for</h3>
            <p className="text-slate-400 text-xs">
              {searchTerm ? "No results match your search." : `Everyone checked in before ${cutoffTime} today.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredAbsentees.map((entry) => (
              <div
                key={entry.student_id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center gap-3 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold text-base flex items-center justify-center">
                  {entry.display_name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm">{entry.display_name}</span>
                  <span className="text-slate-400 text-[10px] font-mono mt-0.5">ID: {entry.student_id}</span>
                </div>
                <div className="mt-1">
                  {entry.status === 'Absent' ? (
                    <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Absent
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Late ({entry.check_in_time})
                    </span>
                  )}
                </div>
                <div className="w-full mt-2 min-h-[38px] flex items-center justify-center">
                  {sentAlertIds[entry.student_id] ? (
                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5 justify-center">
                      ✓ Alert Dispatched
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={alertingIds[entry.student_id]}
                      onClick={() => handleSendAlert(entry.student_id)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      {alertingIds[entry.student_id] ? (
                        <span>Sending...</span>
                      ) : (
                        <span>Send Alert 🔔</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
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
