import {
  ApiError,
  VerifyAttendanceRequest,
  VerifyAttendanceResponse,
} from './types';
const ENDPOINT = 'http://localhost:5000/api/v1/verify_attendance';
export async function verifyAttendance(
  payload: VerifyAttendanceRequest,
  timeoutMs: number = 10_000,
): Promise<VerifyAttendanceResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image_data: payload.image_data,
        subject: payload.subject || 'General'
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      throw new ApiError(
        'HTTP',
        `HTTP error: server returned status ${response.status}`,
      );
    }
    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new ApiError(
        'PARSE',
        'Failed to parse the server response as JSON.',
      );
    }
    const normalizedData: VerifyAttendanceResponse = {
      match_found: !!data.match_found,
      student_name: data.student_name ?? data.name,
      check_in_time: data.check_in_time ?? data.time,
      message: data.message,
    };
    return normalizedData;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof ApiError) {
      throw err;
    }
    if (
      err instanceof DOMException && err.name === 'AbortError'
    ) {
      throw new ApiError('TIMEOUT', 'Verification request timed out after 10 seconds.');
    }
    const detail =
      err instanceof Error ? err.message : 'Unknown network error';
    throw new ApiError('NETWORK', `Network error: ${detail}`);
  }
}
const REGISTER_ENDPOINT = 'http://localhost:5000/api/v1/register_student';
export interface RegisterStudentResponse {
  status: string;
  message: string;
}
export async function registerStudent(
  name: string,
  base64Image: string,
  timeoutMs: number = 15_000
): Promise<RegisterStudentResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(REGISTER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, image_data: base64Image }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Server returned status ${response.status}`);
    }
    return data as RegisterStudentResponse;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Registration timed out. Please try again.');
    }
    throw err instanceof Error ? err : new Error('An unexpected network error occurred.');
  }
}
const DIAGNOSTICS_ENDPOINT = 'http://localhost:5000/api/v1/diagnostics';
export interface DiagnosticsResponse {
  status: string;
  model_name: string;
  detector_backend: string;
  registered_faces_count: number;
  last_inference_latency_ms: number;
  average_inference_latency_ms: number;
  detection_threshold: number;
  system_status: string;
}
export async function fetchDiagnostics(): Promise<DiagnosticsResponse> {
  try {
    const response = await fetch(DIAGNOSTICS_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data = await response.json();
    return data as DiagnosticsResponse;
  } catch (err: unknown) {
    throw err instanceof Error ? err : new Error('Failed to fetch diagnostics.');
  }
}
const LOGS_ENDPOINT = 'http://localhost:5000/api/v1/attendance_logs';
export interface AttendanceLogEntry {
  timestamp: string;
  student_id: string;
  display_name: string;
  subject?: string;
  status: string;
}
export interface AttendanceLogsResponse {
  status: string;
  logs: AttendanceLogEntry[];
}
export async function fetchAttendanceLogs(): Promise<AttendanceLogsResponse> {
  try {
    const response = await fetch(LOGS_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data = await response.json();
    return data as AttendanceLogsResponse;
  } catch (err: unknown) {
    throw err instanceof Error ? err : new Error('Failed to fetch attendance logs.');
  }
}
const STUDENTS_ENDPOINT = 'http://localhost:5000/api/v1/registered_students';
const DEREGISTER_ENDPOINT = 'http://localhost:5000/api/v1/deregister_student';
export interface StudentEntry {
  student_id: string;
  display_name: string;
  file_name: string;
}
export interface RegisteredStudentsResponse {
  status: string;
  students: StudentEntry[];
}
export async function fetchRegisteredStudents(): Promise<RegisteredStudentsResponse> {
  try {
    const response = await fetch(STUDENTS_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data = await response.json();
    return data as RegisteredStudentsResponse;
  } catch (err: unknown) {
    throw err instanceof Error ? err : new Error('Failed to fetch student directory.');
  }
}
export async function deleteStudentProfile(studentId: string): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${DEREGISTER_ENDPOINT}/${studentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data = await response.json();
    return data as { status: string; message: string };
  } catch (err: unknown) {
    throw err instanceof Error ? err : new Error('Failed to deregister student profile.');
  }
}
const ABSENTEES_ENDPOINT = 'http://localhost:5000/api/v1/absentees';
const ALERT_ENDPOINT = 'http://localhost:5000/api/v1/send_absentee_alert';
export interface AbsenteeEntry {
  student_id: string;
  display_name: string;
  status: 'Absent' | 'Late';
  check_in_time: string;
}
export interface AbsenteesResponse {
  status: string;
  cutoff_time: string;
  absentees: AbsenteeEntry[];
}
export async function fetchAbsentees(cutoffTime: string): Promise<AbsenteesResponse> {
  try {
    const response = await fetch(`${ABSENTEES_ENDPOINT}?cutoff_time=${cutoffTime}`);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data = await response.json();
    return data as AbsenteesResponse;
  } catch (err: unknown) {
    throw err instanceof Error ? err : new Error('Failed to fetch absentee logs.');
  }
}
export async function sendAbsenteeAlert(studentId: string): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(ALERT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId }),
    });
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data = await response.json();
    return data as { status: string; message: string };
  } catch (err: unknown) {
    throw err instanceof Error ? err : new Error('Failed to send alert notification.');
  }
}
const STREAKS_ENDPOINT = 'http://localhost:5000/api/v1/attendance_streaks';
export interface StreakEntry {
  student_id: string;
  display_name: string;
  current_streak: number;
  badges: string[];
  last_check_in: string;
}
export interface StreaksResponse {
  status: string;
  streaks: StreakEntry[];
}
export async function fetchAttendanceStreaks(): Promise<StreaksResponse> {
  try {
    const response = await fetch(STREAKS_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data = await response.json();
    return data as StreaksResponse;
  } catch (err: unknown) {
    throw err instanceof Error ? err : new Error('Failed to fetch attendance streaks.');
  }
}
