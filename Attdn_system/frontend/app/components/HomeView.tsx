'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
interface HomeViewProps {
  onStart: (subject: string) => void;
}
export default function HomeView({ onStart }: HomeViewProps): React.JSX.Element {
  const [subject, setSubject] = useState<string>('Mathematics 📐');
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const subjects = [
    'Mathematics 📐',
    'Science 🔬',
    'English 📚',
    'History 🏺',
    'Computer Science 💻',
  ];
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDateStr(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8 text-slate-900">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mx-auto">
        {}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">System Active</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-0.5">Local Time</span>
              <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {timeStr || '00:00:00 AM'}
              </div>
              <div className="text-slate-500 text-xs mt-1">
                {dateStr || 'Loading date...'}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Smart Attendance Portal
            </h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Secure, fast, and contact-free check-in using advanced biometric
              validation. Please ensure you are standing in a well-lit area before
              checking in.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="subject-select" className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                Active Subject
              </label>
              <select
                id="subject-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700 font-semibold text-sm shadow-sm cursor-pointer"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => onStart(subject)}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
            >
              Mark Your Attendance 🔐
            </button>
          </div>
        </div>
        {}
        <div className="md:col-span-7 flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Control Panel & Logs
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {}
            <Link
              href="/register"
              className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-sm rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xl">👤</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Open</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Register Face</h3>
                <p className="text-slate-500 text-xs mt-1">Enroll a new student template with verification checks</p>
              </div>
            </Link>
            {}
            <Link
              href="/students"
              className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-sm rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xl">👥</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">View</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Student Directory</h3>
                <p className="text-slate-500 text-xs mt-1">Manage database records and deregister student files</p>
              </div>
            </Link>
            {}
            <Link
              href="/absentees"
              className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-sm rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xl">⏱️</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Track</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Absentee Tracker</h3>
                <p className="text-slate-500 text-xs mt-1">Check today's lates/absentees and simulate email alerts</p>
              </div>
            </Link>
            {}
            <Link
              href="/streaks"
              className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-sm rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xl">⚡</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Stats</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Attendance Streaks</h3>
                <p className="text-slate-500 text-xs mt-1">Review check-in streaks and early-bird badges</p>
              </div>
            </Link>
            {}
            <Link
              href="/diagnostics"
              className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-sm rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xl">📊</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Check</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">System Diagnostics</h3>
                <p className="text-slate-500 text-xs mt-1">Monitor ML match latency and model parameters</p>
              </div>
            </Link>
            {}
            <Link
              href="/logs"
              className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-sm rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xl">📋</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Logs</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Attendance Logs</h3>
                <p className="text-slate-500 text-xs mt-1">Inspect full historical logs and export spreadsheets</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
