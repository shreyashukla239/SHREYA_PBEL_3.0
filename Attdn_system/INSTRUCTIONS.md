# Setup and Launch Instructions

This document explains how to set up the environment and run both the backend and frontend servers for the project.

---

## 🐍 Backend Server Setup (FastAPI)

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - **PowerShell**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **Windows Command Prompt**:
     ```cmd
     .venv\Scripts\activate.bat
     ```
   - **macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```

4. Install the backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Launch the backend FastAPI server:
   ```bash
   uvicorn main:app --reload --port 5000
   ```

The backend server will run on: **http://localhost:5000**

---

## 🌐 Frontend Server Setup (Next.js)

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install Node packages:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

The frontend portal will open on: **http://localhost:3000**
