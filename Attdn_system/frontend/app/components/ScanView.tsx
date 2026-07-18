'use client';
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import WebcamCapture from './WebcamCapture';
import { detectFaceFrame, cropToCircle } from '../lib/faceDetection';
interface ScanViewProps {
  onCapture: (base64: string) => Promise<void>;
  isProcessing: boolean;
  onCameraError: (message: string) => void;
  subject?: string;
}
export default function ScanView({
  onCapture,
  isProcessing,
  onCameraError,
  subject,
}: ScanViewProps): React.JSX.Element {
  const webcamRef = useRef<Webcam>(null);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (!isProcessing) {
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
  }, [isProcessing]);
  const handleCapture = async (): Promise<void> => {
    const base64 = webcamRef.current?.getScreenshot();
    if (!base64) {
      onCameraError('Could not capture a frame. Please try again.');
      return;
    }
    try {
      const croppedBase64 = await cropToCircle(base64);
      await onCapture(croppedBase64);
    } catch (err) {
      console.error('Cropping failed, fallback to raw capture:', err);
      await onCapture(base64);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full mx-4 flex flex-col items-center gap-6 shadow-sm">
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold text-slate-900">
            Verify Identity
          </h2>
          {subject && (
            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-full px-3.5 py-0.5 inline-flex items-center justify-center">
              <span className="text-blue-800 font-bold text-xs">Checking in for: {subject}</span>
            </div>
          )}
          <p className="text-slate-500 text-xs mt-2">
            Align your face within the guide area
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 flex justify-center items-center w-[400px] h-[300px]">
          <WebcamCapture webcamRef={webcamRef} onCameraError={onCameraError} />
          <div 
            className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(ellipse 80px 105px at center, transparent 99%, rgba(15, 23, 42, 0.65) 100%)'
            }}
          />
          <div
            className={`absolute rounded-full border-4 transition-all duration-300 pointer-events-none z-20 ${
              faceDetected 
                ? 'border-emerald-500' 
                : 'border-rose-500'
            }`}
            style={{
              width: '160px',
              height: '210px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div style={{ position: 'absolute', display: 'none' }} />
        </div>
        <button
          type="button"
          onClick={handleCapture}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3 px-5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Processing Facial Contours...</span>
            </>
          ) : (
            <span>Capture & Verify Identity 📸</span>
          )}
        </button>
      </div>
    </div>
  );
}
