# Starting the Attendance System Backend Server

This document outlines the steps required to start and verify the FastAPI backend server on Windows.

---

## 📋 Prerequisites
Ensure Python is installed and the virtual environment is set up. The dependencies (`fastapi`, `uvicorn`, `deepface`, etc.) are already installed in the `.venv` directory.

---

## 🚀 Starting the Server

You can run the server in two ways: by activating the virtual environment first, or by executing the venv's python/uvicorn binaries directly.

### Option A: Activating the Virtual Environment (Recommended)

1. Open a terminal (PowerShell or Command Prompt) in the `backend/` directory.
2. Activate the virtual environment:
   * **PowerShell**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   * **Command Prompt**:
     ```cmd
     .venv\Scripts\activate.bat
     ```
3. Start the development server using Uvicorn:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Option B: Running Directly via Virtual Environment Path

You can start the server without manual activation by running:
* **PowerShell/Command Prompt**:
  ```powershell
  .venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
  ```

---

## 🔍 Verification

Once started, the server will:
1. Verify the existence of the `registered_students/` and `logs/` directories (and create them dynamically if missing).
2. Download/verify the local VGG-Face model weights.
3. Complete a lightweight dummy warmup pass to cache model graph representation (taking around 5–40 seconds on the first run, and instantly on subsequent restarts).
4. Output `INFO: Application startup complete` and start listening on:
   `http://127.0.0.1:8000`
