# Smart Attendance Portal

A contactless, facial recognition biometric attendance portal powered by **Next.js** and **FastAPI** (using DeepFace).

---

## 🚀 Quick Start

### 1. Start the Backend Server (Port 5000)
Run this command in your terminal from the project root:
- **PowerShell**: `cd backend; .venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 5000`
- **Command Prompt**: `cd backend && .venv\Scripts\activate.bat && uvicorn main:app --reload --port 5000`

### 2. Start the Frontend Web Portal (Port 3000)
Run these commands in a new terminal from the project root:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Registering Students

To add a person to the check-in database:
1. Copy their photo into: `backend/registered_students/`
2. Save the filename in **lowercase** with spaces replaced by **underscores (`_`)**.
   - *Example*: **Shivam Pandey** ➡️ `shivam_pandey.jpg`
   - *Example*: **Alice Johnson** ➡️ `alice_johnson.png`

The system automatically parses `shivam_pandey.jpg` to display `"Shivam Pandey"` on success.

---

## 🧪 Running Tests
To execute the automated vitest suite:
```bash
cd frontend
npm run test
```
