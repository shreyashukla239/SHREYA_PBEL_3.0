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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-slate-900">
      <div className="max-w-4xl w-full flex flex-col gap-8">
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Active Terminal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Smart Attendance Portal
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Select your access portal to proceed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full">Client Side</span>
                <span className="text-xl">📸</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Student Check-In</h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Log attendance securely using real-time facial recognition. Select your subject below to start.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-6">
                <span className="text-[10px] font-bold text-slate-450 tracking-wider uppercase block mb-0.5">System Time</span>
                <div className="text-xl font-bold tracking-tight text-slate-950 font-mono">
                  {timeStr || '00:00:00 AM'}
                </div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  {dateStr || 'Loading...'}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="subject-select" className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Class Subject
                </label>
                <select
                  id="subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700 font-semibold text-xs shadow-sm cursor-pointer"
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
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs py-3 px-5 rounded-xl transition-all cursor-pointer text-center shadow-sm"
              >
                Start Verification Scan 🔐
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-550 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">Admin Side</span>
                <span className="text-xl">⚙️</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">System Management</h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Access administrative controls to manage records, search directories, review streaks, inspect logs, and debug latency metrics.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-6 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-450 tracking-wider uppercase block">Administrative Scope</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>User Directory</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>Real-Time Logs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>Attendance Stats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>Diagnostics</span>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/admin"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-5 rounded-xl transition-colors cursor-pointer text-center shadow-sm block"
            >
              Go to Admin Dashboard 🛡️
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
