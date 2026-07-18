'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchDiagnostics, DiagnosticsResponse } from '../lib/apiClient';
export default function DiagnosticsPage(): React.JSX.Element {
  const [data, setData] = useState<DiagnosticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const loadDiagnostics = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchDiagnostics();
      if (res.status === 'success') {
        setData(res);
      } else {
        setErrorMsg('Invalid telemetry response format.');
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to query diagnostics.'
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDiagnostics();
  }, []);
  const getLatencyColorClass = (latency: number) => {
    if (latency === 0) return 'text-slate-400';
    if (latency < 800) return 'text-emerald-600';
    if (latency < 1800) return 'text-amber-600';
    return 'text-rose-600';
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-2xl w-full mx-auto shadow-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            System Diagnostics
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time telemetry and biometric engine parameters
          </p>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-slate-500 font-semibold text-xs">Querying diagnostics...</span>
          </div>
        ) : errorMsg ? (
          <div className="bg-rose-50 border border-rose-250 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
            <span className="font-bold text-rose-950 text-sm">Telemetry Fetch Failed</span>
            <p className="text-rose-700 text-xs">{errorMsg}</p>
            <button
              type="button"
              onClick={loadDiagnostics}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Core Engine Status</span>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                {data.system_status}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-0.5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Profiles</span>
                <span className="text-xl font-bold text-slate-800 mt-0.5">{data.registered_faces_count}</span>
                <span className="text-[10px] text-slate-400">Database Count</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-0.5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Model</span>
                <span className="text-xl font-bold text-blue-600 mt-0.5">{data.model_name}</span>
                <span className="text-[10px] text-slate-400">Detector: {data.detector_backend}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-0.5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Run Speed</span>
                <span className={`text-xl font-bold mt-0.5 ${getLatencyColorClass(data.last_inference_latency_ms)}`}>
                  {data.last_inference_latency_ms > 0 ? `${data.last_inference_latency_ms} ms` : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-400">Execution latency</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-0.5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Latency (10 runs)</span>
                <span className={`text-xl font-bold mt-0.5 ${getLatencyColorClass(data.average_inference_latency_ms)}`}>
                  {data.average_inference_latency_ms > 0 ? `${data.average_inference_latency_ms} ms` : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-400">Rolling speed average</span>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 text-xs text-slate-600">
              <h3 className="font-bold text-slate-700">Verification Boundary Constraints</h3>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span>Distance Metric</span>
                <span className="font-semibold text-slate-800">Cosine Distance</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pass Threshold</span>
                <span className="font-semibold text-slate-800">&lt;= {data.detection_threshold} (Auto-enforced)</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                type="button"
                onClick={loadDiagnostics}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
              >
                🔄 Refresh Telemetry
              </button>
              <Link
                href="/"
                className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
              >
                Return Home
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
