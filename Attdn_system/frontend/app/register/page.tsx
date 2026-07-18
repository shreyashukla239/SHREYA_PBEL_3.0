'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Webcam from 'react-webcam';
import WebcamCapture from '../components/WebcamCapture';
import { detectFaceFrame } from '../lib/faceDetection';
import { registerStudent } from '../lib/apiClient';
type RegisterStep = 'INPUT' | 'SCAN' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
export default function RegisterPage(): React.JSX.Element {
  const [name, setName] = useState<string>('');
  const [step, setStep] = useState<RegisterStep>('INPUT');
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const webcamRef = useRef<Webcam>(null);
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (step === 'SCAN') {
      intervalId = setInterval(() => {
        const video = webcamRef.current?.video;
        if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
          const detected = detectFaceFrame(video);
          setFaceDetected(detected);
        } else {
          setFaceDetected(false);
        }
      }, 250);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [step]);
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a valid student name.');
      return;
    }
    setStep('SCAN');
  };
  const handleRegister = async () => {
    const base64 = webcamRef.current?.getScreenshot();
    if (!base64) {
      setErrorMessage('Could not capture a frame. Please try again.');
      setStep('ERROR');
      return;
    }
    setStep('PROCESSING');
    try {
      const res = await registerStudent(name, base64);
      if (res.status === 'success') {
        setStep('SUCCESS');
      } else {
        setErrorMessage(res.message || 'Face enrollment failed.');
        setStep('ERROR');
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'A network error occurred during face registration.'
      );
      setStep('ERROR');
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
      {step === 'INPUT' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-sm flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Register Student</h1>
            <p className="text-slate-500 text-xs mt-1">Step 1: Enter student's full name</p>
          </div>
          <form onSubmit={handleNextStep} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="student-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">
                Full Name
              </label>
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Mehta"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-semibold text-slate-800 shadow-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
            >
              Continue to Scanner
            </button>
            <Link
              href="/"
              className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </Link>
          </form>
        </div>
      )}
      {(step === 'SCAN' || step === 'PROCESSING') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-sm flex flex-col items-center gap-6">
          <div className="text-center w-full">
            <h2 className="text-2xl font-bold text-slate-900">Scan Face</h2>
            <p className="text-slate-500 text-xs mt-1">Step 2: Align your face within the guide area</p>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 flex justify-center items-center w-[400px] h-[300px]">
            <WebcamCapture webcamRef={webcamRef} onCameraError={(msg) => {
              setErrorMessage(msg);
              setStep('ERROR');
            }} />
            <div 
              className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-10"
              style={{
                background: 'radial-gradient(ellipse 80px 105px at center, transparent 99%, rgba(15, 23, 42, 0.65) 100%)'
              }}
            />
            <div
              className={`absolute rounded-full border-4 transition-all duration-300 pointer-events-none z-20 ${
                faceDetected ? 'border-emerald-500' : 'border-rose-500'
              }`}
              style={{
                width: '160px',
                height: '210px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <svg
              className={`absolute pointer-events-none z-20 transition-all duration-300 ${
                faceDetected 
                  ? 'text-emerald-500/70 scale-100' 
                  : 'text-slate-400/40 scale-[0.97] animate-pulse'
              }`}
              style={{
                width: '160px',
                height: '210px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              viewBox="0 0 160 210"
            >
              <circle cx="50" cy="80" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="80" r="1" fill="currentColor" />
              <circle cx="110" cy="80" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="110" cy="80" r="1" fill="currentColor" />
              <path d="M80,85 L80,125 M75,125 L85,125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M60,158 Q80,168 100,158" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              disabled={step === 'PROCESSING'}
              onClick={handleRegister}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
            >
              {step === 'PROCESSING' ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Face 👤</span>
              )}
            </button>
            <button
              type="button"
              disabled={step === 'PROCESSING'}
              onClick={() => setStep('INPUT')}
              className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
            >
              Back
            </button>
          </div>
        </div>
      )}
      {step === 'SUCCESS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-sm flex flex-col items-center gap-6">
          <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <h1 className="text-xl font-bold text-emerald-900 text-center">
              Registration Successful!
            </h1>
            <p className="text-emerald-700 text-center text-xs leading-relaxed">
              Welcome, <strong className="font-bold text-emerald-950">{name}</strong>. Your face profile has been registered. You can now check in!
            </p>
          </div>
          <Link
            href="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center block"
          >
            Done &amp; Return Home
          </Link>
        </div>
      )}
      {step === 'ERROR' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-sm flex flex-col items-center gap-6">
          <div className="w-full bg-rose-50 border border-rose-200 rounded-xl p-5 flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold text-rose-900 text-center">
              Registration Failed
            </h1>
            <p className="text-rose-700 text-center text-xs leading-relaxed">
              {errorMessage || 'Make sure a human face is clearly visible to the camera.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              onClick={() => setStep('SCAN')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
            >
              Retry Scan
            </button>
            <button
              type="button"
              onClick={() => setStep('INPUT')}
              className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-3 px-5 rounded-xl transition-colors cursor-pointer text-center"
            >
              Edit Name
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
