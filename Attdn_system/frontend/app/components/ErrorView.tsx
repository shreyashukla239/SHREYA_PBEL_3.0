'use client';
import React from 'react';
interface ErrorViewProps {
  message: string;
  onRetry: () => void;
  onCancel: () => void;
}
export default function ErrorView({
  message,
  onRetry,
  onCancel,
}: ErrorViewProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-sm flex flex-col items-center gap-6">
        <div
          role="alert"
          className="w-full bg-red-50 border border-red-200 rounded-xl p-5 flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-rose-900 text-center">
            Access Denied
          </h2>
          <p className="text-rose-700 text-center text-xs leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
