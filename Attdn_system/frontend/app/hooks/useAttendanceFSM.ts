/**
 * useAttendanceFSM.ts
 *
 * Custom React hook that owns all mutable state for the Smart Attendance
 * Monitoring application and exposes a typed FSM interface to consumers.
 *
 * FSM transitions:
 *   GATE       → SCAN          (startScan)
 *   SCAN       → PROCESSING    (submitFrame — immediately on call)
 *   PROCESSING → SUCCESS       (submitFrame — match_found: true)
 *   PROCESSING → ERROR         (submitFrame — match_found: false or any ApiError)
 *   ERROR      → SCAN          (tryAgain)
 *   ERROR      → GATE          (cancel)
 *   SUCCESS    → GATE          (done — also clears studentResult & errorMessage)
 *   any        → ERROR         (handleCameraError)
 *
 * Each action is a no-op when called from an invalid state, ensuring the FSM
 * is deterministic regardless of component rendering timing or race conditions.
 *
 * Requirements: 1.1–1.8, 4.2, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 6.7
 */

'use client';

import { useState, useCallback } from 'react';

import { verifyAttendance } from '../lib/apiClient';
import { playSuccessChime, playErrorChime } from '../lib/audio';
import {
  AppState,
  StudentResult,
  FSMState,
  FSMActions,
  ApiError,
} from '../lib/types';

// ---------------------------------------------------------------------------
// Error-code → user-facing message mapping
// (See design.md § Error Handling table)
// ---------------------------------------------------------------------------

function mapApiErrorToMessage(err: ApiError): string {
  switch (err.code) {
    case 'NETWORK':
      return 'Network error. Please check your connection and try again.';
    case 'TIMEOUT':
      return 'Verification request timed out. Please try again.';
    case 'HTTP':
      // The ApiError message already contains the HTTP status detail
      return err.message;
    case 'PARSE':
      return 'Unexpected response from server. Please try again.';
    case 'NO_FRAME':
      return 'Could not capture a frame. Please try again.';
    case 'CAPTURE_TIMEOUT':
      return 'Frame capture timed out. Please try again.';
    default: {
      // Exhaustiveness guard — TypeScript will warn if a new code is added
      // without updating this switch.
      const _exhaustive: never = err.code;
      return `An unexpected error occurred (${_exhaustive}). Please try again.`;
    }
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAttendanceFSM(): FSMState & FSMActions {
  const [appState, setAppState] = useState<AppState>('GATE');
  const [studentResult, setStudentResult] = useState<StudentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>('General');

  // -------------------------------------------------------------------------
  // startScan — GATE → SCAN (Req 1.2)
  // -------------------------------------------------------------------------
  const startScan = useCallback((sub?: string) => {
    if (sub) {
      setSubject(sub);
    }
    setAppState((current) => {
      if (current !== 'GATE') return current; // no-op guard
      return 'SCAN';
    });
  }, []);

  // -------------------------------------------------------------------------
  // submitFrame — SCAN → PROCESSING → SUCCESS | ERROR (Req 1.3, 1.4, 1.5,
  //               4.2, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10)
  // -------------------------------------------------------------------------
  const submitFrame = useCallback(async (base64: string) => {
    // Guard: only valid from SCAN
    setAppState((current) => {
      if (current !== 'SCAN') return current; // no-op guard
      return 'PROCESSING';
    });

    // Re-read state after the functional update. Because React batches state
    // updates we check the guard imperatively by inspecting the value we intend
    // to transition from. We use a ref-like approach: if the transition above
    // would have been a no-op we should not proceed with the async work.
    // However, `setAppState` with a function doesn't return the previous value,
    // so we keep a local snapshot before the transition.
    //
    // The cleanest approach: capture the state value via a closure at call time.
    // The hook's `appState` variable captured in this closure reflects the value
    // at the time submitFrame is invoked (before any batched updates). If it is
    // not 'SCAN' we skip the API call entirely.
    if (appState !== 'SCAN') return;

    try {
      const response = await verifyAttendance({ image_data: base64, subject });

      if (response.match_found) {
        // SUCCESS transition (Req 1.3, 5.5, 6.4, 6.5)
        const result: StudentResult = {
          name: response.student_name ?? '',
          checkInTime: response.check_in_time ?? '',
        };
        setStudentResult(result);
        setErrorMessage(null);
        setAppState('SUCCESS');
        playSuccessChime();
      } else {
        setStudentResult(null);
        setErrorMessage(
          'Face not recognized. Please contact administration for registration.',
        );
        setAppState('ERROR');
        playErrorChime();
      }
    } catch (err: unknown) {
      // Map typed ApiError codes to user-facing messages (Req 5.9, 5.10)
      let message: string;

      if (err instanceof ApiError) {
        message = mapApiErrorToMessage(err);
      } else {
        // Unexpected / non-ApiError exception — should not normally occur because
        // apiClient wraps everything, but we defend anyway (Req 8.2)
        message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again.';
      }

      setStudentResult(null);
      setErrorMessage(message);
      setAppState('ERROR');
      playErrorChime();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  // -------------------------------------------------------------------------
  // tryAgain — ERROR → SCAN (Req 1.7)
  // -------------------------------------------------------------------------
  const tryAgain = useCallback(() => {
    setAppState((current) => {
      if (current !== 'ERROR') return current; // no-op guard
      return 'SCAN';
    });
    // Clear error data so it does not leak into the next scan session
    setErrorMessage(null);
  }, []);

  // -------------------------------------------------------------------------
  // cancel — ERROR → GATE (Req 1.8)
  // -------------------------------------------------------------------------
  const cancel = useCallback(() => {
    setAppState((current) => {
      if (current !== 'ERROR') return current; // no-op guard
      return 'GATE';
    });
    setErrorMessage(null);
  }, []);

  // -------------------------------------------------------------------------
  // done — SUCCESS → GATE, clears all session data (Req 1.6, 6.7)
  // -------------------------------------------------------------------------
  const done = useCallback(() => {
    setAppState((current) => {
      if (current !== 'SUCCESS') return current; // no-op guard
      return 'GATE';
    });
    // Property 7: both fields must be null after reset so no prior session
    // data leaks into the next attendance session.
    setStudentResult(null);
    setErrorMessage(null);
  }, []);

  // -------------------------------------------------------------------------
  // handleCameraError — any → ERROR (Req 3.9)
  // -------------------------------------------------------------------------
  const handleCameraError = useCallback((message: string) => {
    setStudentResult(null);
    setErrorMessage(message);
    setAppState('ERROR');
    playErrorChime();
  }, []);

  const forceSuccess = useCallback((name: string, checkInTime: string) => {
    setStudentResult({ name, checkInTime });
    setErrorMessage(null);
    setAppState('SUCCESS');
    playSuccessChime();
  }, []);

  const forceError = useCallback((message: string) => {
    setStudentResult(null);
    setErrorMessage(message);
    setAppState('ERROR');
    playErrorChime();
  }, []);

  return {
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
    forceSuccess,
    forceError,
  };
}
