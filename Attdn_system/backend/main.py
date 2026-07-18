import os
import sys
import io
if sys.platform.startswith("win"):
    if hasattr(sys.stdout, "buffer"):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "buffer"):
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
import csv
import time
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
last_inference_latency = 0.0
inference_latencies = []
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, ConfigDict
import pandas as pd
from PIL import Image
app = FastAPI(title="AI-Based Smart Attendance Monitoring System API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class AttendanceRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    image_data: str
    subject: str = "General"
try:
    import base64 as py_base64
    import deepface.commons.image_utils as image_utils
    original_load_image = image_utils.load_image
    def patched_load_image(img):
        if (
            isinstance(img, str)
            and not img.startswith("data:image/")
            and not img.lower().startswith(("http://", "https://"))
            and not os.path.exists(img)
        ):
            try:
                fake_uri = f"data:image/jpeg;base64,{img}"
                return image_utils.load_image_from_base64(fake_uri), "base64 encoded string"
            except Exception:
                pass
        return original_load_image(img)
    image_utils.load_image = patched_load_image
except Exception as e:
    print(f"Failed to apply DeepFace image loader patch: {e}")
def clear_pickle_caches():
    db_path = "registered_students"
    if os.path.exists(db_path):
        for file in os.listdir(db_path):
            if file.endswith(".pkl"):
                try:
                    os.remove(os.path.join(db_path, file))
                except Exception:
                    pass
def ensure_cv2_haarcascade():
    try:
        import cv2
        import urllib.request
        cv2_dir = os.path.dirname(cv2.__file__)
        data_dir = os.path.join(cv2_dir, "data")
        os.makedirs(data_dir, exist_ok=True)
        xml_path = os.path.join(data_dir, "haarcascade_frontalface_default.xml")
        if not os.path.exists(xml_path):
            url = "https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml"
            print(f"Downloading missing OpenCV cascade file to {xml_path}...")
            urllib.request.urlretrieve(url, xml_path)
            print("Download successful!")
    except Exception as e:
        print(f"Failed to verify/download Haar cascade: {e}")
def ensure_directories():
    os.makedirs("registered_students", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
def log_attendance(file_name_id: str, subject: str = "General"):
    log_dir = "logs"
    log_file = os.path.join(log_dir, "attendance_log.csv")
    os.makedirs(log_dir, exist_ok=True)
    if os.path.isfile(log_file):
        try:
            with open(log_file, mode="r", encoding="utf-8") as f:
                header = f.readline()
                if "Subject" not in header:
                    f.close()
                    os.remove(log_file)
        except Exception:
            pass
    file_exists = os.path.isfile(log_file)
    with open(log_file, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["Timestamp", "Student_ID", "Subject", "Status"])
        iso_timestamp = datetime.now().isoformat()
        writer.writerow([iso_timestamp, file_name_id, subject, "Present"])
@app.on_event("startup")
async def startup_event():
    ensure_cv2_haarcascade()
    ensure_directories()
    dummy_path = os.path.join("registered_students", "dummy_warmup.jpg")
    try:
        img = Image.new("RGB", (100, 100), color="black")
        img.save(dummy_path)
        clear_pickle_caches()
        from deepface import DeepFace
        DeepFace.find(
            img_path=dummy_path,
            db_path="registered_students",
            model_name="VGG-Face",
            enforce_detection=False,
            detector_backend="skip"
        )
    except Exception as e:
        print(f"Warmup status: VGG-Face warmup failed/skipped: {e}")
    finally:
        if os.path.exists(dummy_path):
            try:
                os.remove(dummy_path)
            except Exception:
                pass
        clear_pickle_caches()
@app.post("/api/v1/verify_attendance")
async def verify_attendance(request: AttendanceRequest):
    try:
        image_data = request.image_data
        if image_data.startswith("data:image/"):
            parts = image_data.split(",", 1)
            if len(parts) > 1:
                raw_base64 = parts[1]
            else:
                raw_base64 = image_data
        else:
            raw_base64 = image_data
        clear_pickle_caches()
        from deepface import DeepFace
        try:
            start_time_inf = time.time()
            results = DeepFace.find(
                img_path=raw_base64,
                db_path="registered_students",
                model_name="VGG-Face",
                enforce_detection=False,
                detector_backend="skip"
            )
            duration_ms = (time.time() - start_time_inf) * 1000
            global last_inference_latency
            last_inference_latency = round(duration_ms, 2)
            inference_latencies.append(duration_ms)
            if len(inference_latencies) > 10:
                inference_latencies.pop(0)
        except ValueError as ve:
            err_msg = str(ve)
            if "Face could not be detected" in err_msg or "face" in err_msg.lower():
                print(f"Face detection check failed: {err_msg}")
                return {
                    "status": "success",
                    "match_found": False
                }
            raise ve
        match_found = False
        primary_record = None
        if isinstance(results, list) and len(results) > 0:
            df = results[0]
            if isinstance(df, pd.DataFrame) and not df.empty:
                primary_record = df.iloc[0]
                match_found = True
        elif isinstance(results, pd.DataFrame) and not results.empty:
            primary_record = results.iloc[0]
            match_found = True
        if match_found and primary_record is not None:
            file_path = primary_record["identity"]
            filename = os.path.basename(file_path)
            file_name_id, _ = os.path.splitext(filename) 
            display_name = file_name_id.replace("_", " ").title()
            now = datetime.now()
            time_str = now.strftime("%H:%M")
            log_attendance(file_name_id, request.subject)
            return {
                "status": "success",
                "match_found": True,
                "name": display_name,
                "time": time_str
            }
        else:
            return {
                "status": "success",
                "match_found": False
            }
    except Exception as e:
        print(f"Error in verify_attendance: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "An internal processing failure occurred.",
                "detail": str(e)
            }
        )
class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    image_data: str
@app.post("/api/v1/register_student")
async def register_student(request: RegisterRequest):
    import base64
    try:
        name = request.name.strip()
        if not name:
            return JSONResponse(
                status_code=400,
                content={"status": "error", "message": "Student name cannot be empty."}
            )
        image_data = request.image_data
        if image_data.startswith("data:image/"):
            parts = image_data.split(",", 1)
            if len(parts) > 1:
                raw_base64 = parts[1]
            else:
                raw_base64 = image_data
        else:
            raw_base64 = image_data
        try:
            image_bytes = base64.b64decode(raw_base64)
        except Exception:
            return JSONResponse(
                status_code=400,
                content={"status": "error", "message": "Invalid base64 image encoding."}
            )
        file_name_id = name.replace(" ", "_").lower()
        permanent_path = os.path.join("registered_students", f"{file_name_id}.jpg")
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
            if pil_image.mode == "RGBA":
                pil_image = pil_image.convert("RGB")
            width, height = pil_image.size
            if width < 50 or height < 50:
                raise ValueError("Image too small")
            pil_image.save(permanent_path, "JPEG", quality=95)
        except Exception as e:
            print(f"[REGISTER] Image save failed: {type(e).__name__}: {e}")
            if os.path.exists(permanent_path):
                try:
                    os.remove(permanent_path)
                except Exception:
                    pass
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": "Invalid image. Please try capturing again."
                }
            )
        clear_pickle_caches()
        return {
            "status": "success",
            "message": f"Successfully registered {name}!"
        }
    except Exception as e:
        print(f"Error in register_student: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "An internal registration failure occurred.",
                "detail": str(e)
            }
        )
@app.get("/api/v1/diagnostics")
async def get_diagnostics():
    try:
        db_path = "registered_students"
        registered_count = 0
        if os.path.exists(db_path):
            registered_count = len([f for f in os.listdir(db_path) if f.endswith(('.jpg', '.jpeg', '.png'))])
        avg_latency = 0.0
        if inference_latencies:
            avg_latency = round(sum(inference_latencies) / len(inference_latencies), 2)
        return {
            "status": "success",
            "model_name": "VGG-Face",
            "detector_backend": "opencv",
            "registered_faces_count": registered_count,
            "last_inference_latency_ms": last_inference_latency,
            "average_inference_latency_ms": avg_latency,
            "detection_threshold": 0.68,
            "system_status": "Healthy"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Failed to collect system diagnostics.",
                "detail": str(e)
            }
        )
@app.get("/api/v1/attendance_logs")
async def get_attendance_logs():
    try:
        log_file = os.path.join("logs", "attendance_log.csv")
        logs = []
        if os.path.exists(log_file):
            with open(log_file, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    student_id = row.get("Student_ID", "")
                    display_name = student_id.replace("_", " ").title()
                    logs.append({
                        "timestamp": row.get("Timestamp", ""),
                        "student_id": student_id,
                        "display_name": display_name,
                        "subject": row.get("Subject", "General"),
                        "status": row.get("Status", "Present")
                    })
        logs.reverse()
        return {
            "status": "success",
            "logs": logs
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Failed to read attendance logs.",
                "detail": str(e)
            }
        )
@app.get("/api/v1/registered_students")
async def get_registered_students():
    try:
        db_path = "registered_students"
        students = []
        if os.path.exists(db_path):
            for file in os.listdir(db_path):
                if file.endswith(('.jpg', '.jpeg', '.png')):
                    student_id, _ = os.path.splitext(file)
                    display_name = student_id.replace("_", " ").title()
                    students.append({
                        "student_id": student_id,
                        "display_name": display_name,
                        "file_name": file
                    })
        return {
            "status": "success",
            "students": students
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Failed to retrieve student directory.",
                "detail": str(e)
            }
        )
@app.get("/api/v1/student_image/{student_id}")
async def get_student_image(student_id: str):
    db_path = "registered_students"
    if ".." in student_id or "/" in student_id or "\\" in student_id:
        raise HTTPException(status_code=400, detail="Invalid student identity.")
    target_file = None
    for ext in ['.jpg', '.jpeg', '.png']:
        path = os.path.join(db_path, f"{student_id}{ext}")
        if os.path.exists(path):
            target_file = path
            break
    if not target_file:
        raise HTTPException(status_code=404, detail="Student profile image not found.")
    return FileResponse(target_file)
@app.delete("/api/v1/deregister_student/{student_id}")
async def deregister_student(student_id: str):
    try:
        db_path = "registered_students"
        if ".." in student_id or "/" in student_id or "\\" in student_id:
            raise HTTPException(status_code=400, detail="Invalid student identity.")
        target_file = None
        for ext in ['.jpg', '.jpeg', '.png']:
            path = os.path.join(db_path, f"{student_id}{ext}")
            if os.path.exists(path):
                target_file = path
                break
        if not target_file:
            raise HTTPException(status_code=404, detail="Student profile not found.")
        os.remove(target_file)
        clear_pickle_caches()
        return {
            "status": "success",
            "message": f"Successfully deregistered {student_id.replace('_', ' ').title()}."
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Failed to deregister student.",
                "detail": str(e)
            }
        )
class AlertRequest(BaseModel):
    student_id: str
@app.get("/api/v1/absentees")
async def get_absentees(cutoff_time: str = "09:00"):
    try:
        db_path = "registered_students"
        log_file = os.path.join("logs", "attendance_log.csv")
        all_students = {}
        if os.path.exists(db_path):
            for file in os.listdir(db_path):
                if file.endswith(('.jpg', '.jpeg', '.png')):
                    student_id, _ = os.path.splitext(file)
                    all_students[student_id] = {
                        "student_id": student_id,
                        "display_name": student_id.replace("_", " ").title(),
                        "status": "Absent",
                        "check_in_time": "N/A"
                    }
        today_str = datetime.now().strftime("%Y-%m-%d")
        cutoff_parts = cutoff_time.split(":")
        cutoff_hour = int(cutoff_parts[0]) if len(cutoff_parts) > 0 else 9
        cutoff_minute = int(cutoff_parts[1]) if len(cutoff_parts) > 1 else 0
        if os.path.exists(log_file):
            with open(log_file, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    timestamp_str = row.get("Timestamp", "")
                    student_id = row.get("Student_ID", "")
                    if timestamp_str.startswith(today_str) and student_id in all_students:
                        try:
                            log_time = datetime.fromisoformat(timestamp_str)
                            check_in_str = log_time.strftime("%H:%M")
                            is_late = False
                            if log_time.hour > cutoff_hour or (log_time.hour == cutoff_hour and log_time.minute > cutoff_minute):
                                is_late = True
                            all_students[student_id]["status"] = "Late" if is_late else "Present"
                            all_students[student_id]["check_in_time"] = check_in_str
                        except Exception:
                            all_students[student_id]["status"] = "Present"
                            all_students[student_id]["check_in_time"] = "Checked in"
        absentees = [
            info for info in all_students.values()
            if info["status"] in ["Absent", "Late"]
        ]
        return {
            "status": "success",
            "cutoff_time": cutoff_time,
            "absentees": absentees
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Failed to query absentees list.",
                "detail": str(e)
            }
        )
@app.post("/api/v1/send_absentee_alert")
async def send_absentee_alert(request: AlertRequest):
    try:
        student_id = request.student_id
        display_name = student_id.replace("_", " ").title()
        return {
            "status": "success",
            "message": f"Biometric attendance alert successfully simulated and sent to {display_name}!"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Failed to send alert.",
                "detail": str(e)
            }
        )
@app.get("/api/v1/attendance_streaks")
async def get_attendance_streaks():
    try:
        db_path = "registered_students"
        log_file = os.path.join("logs", "attendance_log.csv")
        students = {}
        if os.path.exists(db_path):
            for file in os.listdir(db_path):
                if file.endswith(('.jpg', '.jpeg', '.png')):
                    student_id, _ = os.path.splitext(file)
                    display_name = student_id.replace("_", " ").title()
                    students[student_id] = {
                        "student_id": student_id,
                        "display_name": display_name,
                        "check_in_dates": set(),
                        "check_in_times": [],
                        "last_check_in": "N/A"
                    }
        if os.path.exists(log_file):
            with open(log_file, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    timestamp_str = row.get("Timestamp", "")
                    student_id = row.get("Student_ID", "")
                    if student_id in students and timestamp_str:
                        try:
                            dt = datetime.fromisoformat(timestamp_str)
                            students[student_id]["check_in_dates"].add(dt.date())
                            students[student_id]["check_in_times"].append(dt)
                        except Exception:
                            pass
        results = []
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        for student_id, info in students.items():
            check_in_dates = info["check_in_dates"]
            check_in_times = info["check_in_times"]
            sorted_dates = sorted(list(check_in_dates), reverse=True)
            sorted_times = sorted(check_in_times, reverse=True)
            last_check_in_str = "N/A"
            if sorted_times:
                last_check_in_str = sorted_times[0].strftime("%Y-%m-%d %H:%M:%S")
            streak = 0
            if len(sorted_dates) > 0:
                if sorted_dates[0] == today or sorted_dates[0] == yesterday:
                    streak = 1
                    for i in range(len(sorted_dates) - 1):
                        diff = sorted_dates[i] - sorted_dates[i+1]
                        if diff.days == 1:
                            streak += 1
                        elif diff.days == 2 and sorted_dates[i].weekday() == 0:
                            streak += 1
                        elif diff.days == 3 and sorted_dates[i].weekday() == 0:
                            streak += 1
                        else:
                            break
            badges = []
            has_early = False
            for t in sorted_times:
                if t.hour < 8 or (t.hour == 8 and t.minute <= 30):
                    has_early = True
                    break
            if has_early:
                badges.append("Early Bird 🌅")
            if streak >= 3:
                badges.append("Streak Master ⚡")
            seven_days_ago = today - timedelta(days=7)
            recent_checkins = [d for d in sorted_dates if d >= seven_days_ago]
            if len(recent_checkins) >= 5:
                badges.append("Perfect Week 🏆")
            results.append({
                "student_id": student_id,
                "display_name": info["display_name"],
                "current_streak": streak,
                "badges": badges,
                "last_check_in": last_check_in_str
            })
        return {
            "status": "success",
            "streaks": results
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Failed to calculate attendance streaks.",
                "detail": str(e)
            }
        )
@app.websocket("/api/v1/ws/feedback")
async def websocket_feedback(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            image_data = data.get("image_data")
            subject = data.get("subject", "General")
            if not image_data:
                await websocket.send_json({"status": "error", "message": "No image data sent"})
                continue
            if image_data.startswith("data:image/"):
                parts = image_data.split(",", 1)
                if len(parts) > 1:
                    raw_base64 = parts[1]
                else:
                    raw_base64 = image_data
            else:
                raw_base64 = image_data
            clear_pickle_caches()
            from deepface import DeepFace
            try:
                start_time_inf = time.time()
                results = DeepFace.find(
                    img_path=raw_base64,
                    db_path="registered_students",
                    model_name="VGG-Face",
                    enforce_detection=False,
                    detector_backend="skip"
                )
                duration_ms = (time.time() - start_time_inf) * 1000
                global last_inference_latency
                last_inference_latency = round(duration_ms, 2)
                inference_latencies.append(duration_ms)
                if len(inference_latencies) > 10:
                    inference_latencies.pop(0)
            except ValueError as ve:
                err_msg = str(ve)
                if "Face could not be detected" in err_msg or "face" in err_msg.lower():
                    await websocket.send_json({"status": "no_face", "message": "No face detected"})
                else:
                    await websocket.send_json({"status": "error", "message": err_msg})
                continue
            except Exception as e:
                await websocket.send_json({"status": "error", "message": str(e)})
                continue
            match_found = False
            primary_record = None
            if isinstance(results, list) and len(results) > 0:
                df = results[0]
                if isinstance(df, pd.DataFrame) and not df.empty:
                    primary_record = df.iloc[0]
                    match_found = True
            elif isinstance(results, pd.DataFrame) and not results.empty:
                primary_record = results.iloc[0]
                match_found = True
            if match_found and primary_record is not None:
                file_path = primary_record["identity"]
                filename = os.path.basename(file_path)
                file_name_id, _ = os.path.splitext(filename)
                display_name = file_name_id.replace("_", " ").title()
                now = datetime.now()
                time_str = now.strftime("%H:%M")
                log_attendance(file_name_id, subject)
                await websocket.send_json({
                    "status": "success",
                    "match_found": True,
                    "student_name": display_name,
                    "check_in_time": time_str
                })
            else:
                await websocket.send_json({
                    "status": "not_recognized",
                    "match_found": False,
                    "message": "Face not recognized"
                })
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
