export type AppState = 'GATE' | 'SCAN' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
export interface StudentResult {
  name: string;
  checkInTime: string;
}
export interface SessionData {
  studentResult: StudentResult | null;
  errorMessage: string | null;
}
export interface FSMState {
  appState: AppState;
  studentResult: StudentResult | null;
  errorMessage: string | null;
  subject?: string;
}
export interface FSMActions {
  startScan: (subject?: string) => void;
  submitFrame: (base64: string) => Promise<void>;
  tryAgain: () => void;
  cancel: () => void;
  done: () => void;
  handleCameraError: (message: string) => void;
  forceSuccess: (name: string, checkInTime: string) => void;
  forceError: (message: string) => void;
}
export interface VerifyAttendanceRequest {
  image_data: string;
  subject?: string;
}
export interface VerifyAttendanceResponse {
  match_found: boolean;
  student_name?: string;
  check_in_time?: string;
  message?: string;
}
export type ApiErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'HTTP'
  | 'PARSE'
  | 'NO_FRAME'
  | 'CAPTURE_TIMEOUT';
export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
