'use client';
import React from 'react';
import { useAttendanceFSM } from '../hooks/useAttendanceFSM';
import ErrorBoundary from './ErrorBoundary';
import HomeView from './HomeView';
import ScanView from './ScanView';
import SuccessView from './SuccessView';
import ErrorView from './ErrorView';
export default function AttendancePortal(): React.JSX.Element {
  const {
    appState,
    studentResult,
    errorMessage,
    subject,
    startScan,
    submitFrame,
    tryAgain,
    cancel,
    done,
    handleCameraError,
  } = useAttendanceFSM();
  function renderView(): React.JSX.Element {
    switch (appState) {
      case 'GATE':
        return <HomeView onStart={startScan} />;
      case 'SCAN':
      case 'PROCESSING':
        return (
          <ScanView
            onCapture={submitFrame}
            isProcessing={appState === 'PROCESSING'}
            onCameraError={handleCameraError}
            subject={subject}
          />
        );
      case 'SUCCESS':
        return <SuccessView result={studentResult!} onDone={done} />;
      case 'ERROR':
        return (
          <ErrorView
            message={errorMessage!}
            onRetry={tryAgain}
            onCancel={cancel}
          />
        );
    }
  }
  return <ErrorBoundary>{renderView()}</ErrorBoundary>;
}
