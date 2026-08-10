# 💊 Pharma Complaint Copilot

An AI-powered pharmaceutical complaint management system that helps users capture, analyze, assess, store, and manage customer complaints through an intuitive web interface.

## 🚀 Live Demo

**Frontend:**
https://complaint-management-ai.vercel.app

**Backend API:**
https://complaint-management-ai.onrender.com

> The backend API is deployed separately on Render and the frontend is deployed on Vercel.

---

## 📌 Overview

Pharma Complaint Copilot is a full-stack web application designed to simplify pharmaceutical complaint intake and case management.

The application allows users to:

* Enter pharmaceutical complaint information
* Use an AI Copilot to extract complaint details
* Automatically assess complaint risk
* Save and update complaints
* Search complaint history
* Delete complaints
* Upload complaint PDFs
* Generate complaint reports as PDFs
* View complaint analytics
* Monitor complaints by risk level and country

---

## ✨ Key Features

### 🤖 AI Complaint Copilot

Users can describe a complaint in natural language, and the system extracts relevant complaint information and updates the complaint form.

### 🛡️ Risk Assessment

Complaints are categorized into:

* 🔴 High Risk
* 🟠 Medium Risk
* 🟢 Low Risk

The system also generates a summary and risk reason based on the complaint information.

### 📋 Complaint Management

Users can:

* Create complaints
* Edit complaints
* Delete complaints
* Search complaints
* View complaint history

### 📄 PDF Processing

The application supports:

* PDF complaint uploads
* Automatic complaint information extraction
* PDF report generation

### 📊 Dashboard & Analytics

The dashboard provides:

* Total complaints
* High-risk complaints
* Medium-risk complaints
* Low-risk complaints
* Risk distribution charts
* Complaints by country

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      User           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React Frontend      │
                    │       Vercel        │
                    └──────────┬──────────┘
                               │
                         REST API Calls
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Backend API         │
                    │      Render         │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
          Complaint API    AI Processing    PDF Processing
                │              │              │
                └──────────────┼──────────────┘
                               ▼
                    Complaint Management
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Redux Toolkit
* Recharts
* CSS

### Backend

* Python
* FastAPI
* REST API
* ReportLab
* PDF processing

### Deployment

* Vercel — Frontend
* Render — Backend
* GitHub — Source Code

---

## 📂 Project Structure

```text
complaint-management-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx
│   │   ├── features/
│   │   │   ├── chatSlice.js
│   │   │   └── formSlice.js
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint          | Purpose                      |
| ------ | ----------------- | ---------------------------- |
| GET    | `/complaints`     | Get complaint history        |
| GET    | `/dashboard`      | Get dashboard statistics     |
| POST   | `/chat`           | Process AI complaint input   |
| POST   | `/update`         | Update complaint fields      |
| POST   | `/submit`         | Save a complaint             |
| PUT    | `/complaint/{id}` | Update an existing complaint |
| DELETE | `/complaint/{id}` | Delete a complaint           |
| POST   | `/upload`         | Upload and process a PDF     |
| POST   | `/generate-pdf`   | Generate a complaint report  |

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Pranjali-0712/complaint-management-ai.git
cd complaint-management-ai
```

### 2. Run the backend

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn main:app --reload
```

### 3. Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🌐 Deployment

The application is deployed using:

**Frontend**

Vercel

**Backend**

Render

The production frontend communicates with the deployed backend through:

```text
https://complaint-management-ai.onrender.com
```

---

## 🔐 Important Configuration

For local development, the frontend API URL can be configured in:

```text
frontend/src/App.jsx
```

Production backend:

```javascript
const API_URL = "https://complaint-management-ai.onrender.com";
```

For a production-grade application, environment variables should be preferred for API configuration.

---

## 📸 Screenshots

Add screenshots of:

1. Dashboard
2. New Complaint page
3. AI Copilot
4. Complaint History
5. Analytics
6. Generated PDF

Example:

```markdown
## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### AI Complaint Copilot
![AI Copilot](screenshots/ai-copilot.png)

### Complaint History
![Complaint History](screenshots/complaint-history.png)

### Analytics
![Analytics](screenshots/analytics.png)
```

---

## 🎯 Use Case

The system can be used as a prototype for pharmaceutical complaint intake and case management, helping organizations organize complaint information, prioritize risks, and maintain complaint records.

---

## 🔮 Future Enhancements

* User authentication and role-based access
* PostgreSQL/MySQL production database
* Advanced AI-based risk classification
* Multi-language complaint processing
* Email notifications for high-risk complaints
* Complaint status workflow
* Audit logs
* Advanced analytics
* Cloud-based document storage

---

## 👩‍💻 Developer

**Pranjali Tiwari**

Computer Science & Engineering

GitHub:
https://github.com/Pranjali-0712

---

## ⭐ Project Highlights

* Full-stack web application
* AI-assisted complaint processing
* REST API integration
* PDF upload and generation
* Risk assessment
* Dashboard analytics
* CRUD complaint management
* Cloud deployment
* Responsive web interface
