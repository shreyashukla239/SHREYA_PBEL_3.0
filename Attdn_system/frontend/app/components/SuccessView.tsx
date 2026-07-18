'use client';
import React from 'react';
import { StudentResult } from '../lib/types';
interface SuccessViewProps {
  result: StudentResult;
  onDone: () => void;
}
export default function SuccessView({ result, onDone }: SuccessViewProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-sm flex flex-col items-center gap-6">
        <div className="w-full bg-emerald-50 border border-emerald-250 rounded-xl p-5 flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
            ✓
          </div>
          <h1 className="text-xl font-bold text-emerald-900 text-center">
            Access Granted
          </h1>
          <span className="inline-flex items-center bg-emerald-600 text-white text-xs font-bold px-3.5 py-0.5 rounded-full">
            Present
          </span>
          <div className="w-full text-center border-t border-emerald-200/40 pt-3.5">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-0.5">
              Verified Student
            </p>
            <p className="text-base font-bold text-slate-800">
              {result.name}
            </p>
          </div>
          <div className="w-full text-center border-t border-emerald-200/40 pt-3.5">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-0.5">
              Check-In Time
            </p>
            <p className="text-xs font-semibold text-slate-650">
              {result.checkInTime}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
        >
          Done &amp; Return
        </button>
      </div>
    </div>
  );
}
