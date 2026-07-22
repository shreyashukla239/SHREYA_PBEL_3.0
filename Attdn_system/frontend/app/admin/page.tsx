'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-slate-900">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Admin Console</h1>
            <p className="text-slate-500 text-xs mt-1">Manage system configurations, profiles, and attendance data</p>
          </div>
          <Link
            href="/"
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm"
          >
            ← Return to Homepage 🏠
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
          
          <Link
            href="/register"
            className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-sm rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-4"
          >
            <div className="flex justify-between items-start">
              <span className="text-2xl">👤</span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Setup</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Register Face</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Enroll a new student template with verification checks</p>
            </div>
          </Link>

          <Link
            href="/students"
            className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-sm rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-4"
          >
            <div className="flex justify-between items-start">
              <span className="text-2xl">👥</span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">View</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Student Directory</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Manage database records and deregister student files</p>
            </div>
          </Link>

          <Link
            href="/absentees"
            className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-sm rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-4"
          >
            <div className="flex justify-between items-start">
              <span className="text-2xl">⏱️</span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Track</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Absentee Tracker</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Check today's lates/absentees and simulate email alerts</p>
            </div>
          </Link>

          <Link
            href="/streaks"
            className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-sm rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-4"
          >
            <div className="flex justify-between items-start">
              <span className="text-2xl">⚡</span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Stats</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Attendance Streaks</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Review check-in streaks and early-bird badges</p>
            </div>
          </Link>

          <Link
            href="/diagnostics"
            className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-sm rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-4"
          >
            <div className="flex justify-between items-start">
              <span className="text-2xl">📊</span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Check</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System Diagnostics</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Monitor ML match latency and model parameters</p>
            </div>
          </Link>

          <Link
            href="/logs"
            className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-sm rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-4"
          >
            <div className="flex justify-between items-start">
              <span className="text-2xl">📋</span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Logs</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Attendance Logs</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Inspect full historical logs and export spreadsheets</p>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
