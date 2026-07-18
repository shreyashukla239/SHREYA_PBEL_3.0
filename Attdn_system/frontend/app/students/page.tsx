'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchRegisteredStudents, deleteStudentProfile, StudentEntry } from '../lib/apiClient';
export default function StudentsDirectoryPage(): React.JSX.Element {
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loadStudents = async () => {
    setLoading(true);
    setErrorMsg('');
    setConfirmDeleteId(null);
    try {
      const res = await fetchRegisteredStudents();
      if (res.status === 'success') {
        setStudents(res.students);
      } else {
        setErrorMsg('Invalid student data response.');
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to fetch student list.'
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadStudents();
  }, []);
  const handleDelete = async (studentId: string) => {
    setDeletingId(studentId);
    try {
      const res = await deleteStudentProfile(studentId);
      if (res.status === 'success') {
        setStudents((prev) => prev.filter((s) => s.student_id !== studentId));
        setConfirmDeleteId(null);
      } else {
        alert(res.message || 'Failed to delete student profile.');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'A network error occurred.');
    } finally {
      setDeletingId(null);
    }
  };
  const filteredStudents = students.filter((student) =>
    student.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-4xl w-full mx-auto shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
            <p className="text-slate-500 text-xs mt-1">Manage registered student face profiles</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadStudents}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              🔄 Refresh
            </button>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
            >
              ➕ Register Face
            </Link>
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
            <span className="text-slate-500 font-medium text-xs">Loading registered profiles...</span>
          </div>
        ) : errorMsg ? (
          <div className="bg-rose-50 border border-rose-250 rounded-xl p-6 text-center flex flex-col items-center gap-3">
            <span className="font-bold text-rose-950 text-sm">Directory Load Failure</span>
            <p className="text-rose-700 text-xs">{errorMsg}</p>
            <button
              type="button"
              onClick={loadStudents}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-1.5 px-4 rounded-xl cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="border border-slate-200 border-dashed rounded-xl p-12 text-center flex flex-col items-center gap-2">
            <span className="text-2xl">👥</span>
            <h3 className="font-bold text-slate-700 text-sm">No profiles registered</h3>
            <p className="text-slate-400 text-xs">
              {searchTerm ? "No entries match your search query." : "Register a student to start."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student.student_id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center gap-3 shadow-sm"
              >
                <div className="relative overflow-hidden w-24 h-32 rounded-full border border-slate-200 bg-slate-900 flex justify-center items-center">
                  <img
                    src={`http://localhost:5000/api/v1/student_image/${student.student_id}`}
                    alt={student.display_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${student.display_name}`;
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm">{student.display_name}</span>
                  <span className="text-slate-400 text-[10px] font-mono mt-0.5">ID: {student.student_id}</span>
                </div>
                <div className="w-full mt-1 min-h-[38px] flex items-center justify-center">
                  {confirmDeleteId === student.student_id ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        type="button"
                        disabled={deletingId === student.student_id}
                        onClick={() => handleDelete(student.student_id)}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-[11px] py-1.5 rounded-lg"
                      >
                        {deletingId === student.student_id ? 'Removing...' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] py-1.5 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(student.student_id)}
                      className="w-full text-rose-600 hover:bg-rose-50 font-semibold text-xs py-1.5 rounded-lg border border-transparent hover:border-rose-100"
                    >
                      Deregister Profile 🗑️
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
