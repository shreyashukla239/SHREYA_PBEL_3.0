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
  forceSuccess?: (name: string, checkInTime: string) => void;
  forceError?: (message: string) => void;
}
export default function ScanView({
  onCapture,
  isProcessing,
  onCameraError,
  subject,
  forceSuccess,
  forceError,
}: ScanViewProps): React.JSX.Element {
  const webcamRef = useRef<Webcam>(null);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [wsStatus, setWsStatus] = useState<string>('Connected');
  const wsRef = useRef<WebSocket | null>(null);
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
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000/api/v1/ws/feedback');
    wsRef.current = socket;
    socket.onopen = () => {
      setWsStatus('Connected');
    };
    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.status === 'success' && response.match_found) {
          setWsStatus('Match found! Redirecting...');
          if (forceSuccess) {
            forceSuccess(response.student_name, response.check_in_time);
          }
        } else if (response.status === 'not_recognized') {
          setWsStatus('Face not recognized. Keep positioning...');
        } else if (response.status === 'no_face') {
          setWsStatus('Align your face inside the guide.');
        } else if (response.status === 'error') {
          console.error('WS processing error:', response.message);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };
    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      setWsStatus('Offline');
    };
    socket.onclose = () => {
      setWsStatus('Disconnected');
    };
    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [forceSuccess]);
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    const sendFrame = async () => {
      if (
        faceDetected &&
        !isProcessing &&
        wsRef.current?.readyState === WebSocket.OPEN
      ) {
        const base64 = webcamRef.current?.getScreenshot();
        if (base64) {
          try {
            setWsStatus('Analyzing facial features...');
            const croppedBase64 = await cropToCircle(base64);
            wsRef.current.send(
              JSON.stringify({
                image_data: croppedBase64,
                subject: subject || 'General',
              })
            );
          } catch (err) {
            console.error('WS Frame send failed:', err);
          }
        }
      }
    };
    if (faceDetected && !isProcessing) {
      timerId = setInterval(sendFrame, 1500);
      sendFrame();
    } else {
      setWsStatus(faceDetected ? 'Face Aligned! Analyzing...' : 'Align your face inside the guide.');
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [faceDetected, isProcessing, subject]);
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
  const statusIcon = (() => {
    if (wsStatus.includes('Match found')) return '✅';
    if (wsStatus.includes('Analyzing')) return '🔍';
    if (wsStatus.includes('not recognized')) return '⚠️';
    if (wsStatus.includes('Align')) return '👤';
    if (wsStatus === 'Connected') return '🟢';
    if (wsStatus === 'Offline' || wsStatus === 'Disconnected') return '🔴';
    return '🔵';
  })();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full mx-4 flex flex-col items-center gap-5 shadow-sm">
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold text-slate-900">
            Verify Identity
          </h2>
          {subject && (
            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-full px-3.5 py-0.5 inline-flex items-center justify-center">
              <span className="text-blue-800 font-bold text-xs">Checking in for: {subject}</span>
            </div>
          )}
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
          <div style={{ position: 'absolute', display: 'none' }} />
        </div>

        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">{statusIcon}</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Real-Time Auto Verification</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{wsStatus}</p>
          </div>
          {faceDetected && !isProcessing && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCapture}
          disabled={isProcessing}
          className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Processing Facial Contours...</span>
            </>
          ) : (
            <span>Manual Capture (Backup) 📸</span>
          )}
        </button>
      </div>
    </div>
  );
}
