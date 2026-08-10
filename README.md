# AI Customer Complaint Management System

An AI-powered customer complaint management system that combines a **FastAPI backend, LangGraph-based AI workflow, and React frontend** to process, validate, summarize, and manage customer complaints.

## 🚀 Overview

The AI Customer Complaint Management System is designed to streamline the complaint-handling process.

Instead of manually processing every complaint, the system uses an AI workflow to:

* Extract important complaint information
* Validate the extracted information
* Generate a concise complaint summary
* Assess complaint risk
* Generate a complaint report
* Provide an interactive frontend for users

## ✨ Key Features

### 🤖 AI Complaint Processing

Uses a LangGraph workflow to organize the complaint-processing pipeline into multiple stages.

### 📝 Complaint Information Extraction

Extracts relevant information such as:

* Complaint number
* Complaint date
* Customer information
* Complaint details
* Other required complaint fields

### ✅ Validation

Validates the extracted complaint information before producing the final result.

### 📋 Complaint Summarization

Converts complaint information into a concise summary that can be easily reviewed.

### ⚠️ Risk Assessment

Analyzes complaint information and produces a risk assessment to help prioritize complaints.

### 📄 PDF Report Generation

Generates a complaint report in PDF format.

### 💬 AI Assistant

Provides an interactive AI assistant interface through the React frontend.

### 📊 Dashboard & History

The frontend includes pages for:

* Dashboard
* Complaint submission
* AI Assistant
* Analytics
* Complaint History

## 🧠 AI Workflow

The backend uses **LangGraph** to structure the complaint-processing workflow.

```text
User Complaint
      ↓
Information Extraction
      ↓
Validation
      ↓
Complaint Summary
      ↓
Risk Assessment
      ↓
Final Result
      ↓
PDF Report
```

This workflow makes the processing pipeline modular and easier to extend.

## 🛠️ Tech Stack

### Backend

* Python
* FastAPI
* LangGraph
* Pydantic
* SQLite / Database integration
* PDF generation

### Frontend

* React
* Vite
* JavaScript
* Redux Toolkit
* CSS

### Development Tools

* Git
* GitHub
* VS Code
* Python Virtual Environment
* npm

## 📁 Project Structure

```text
complaint-management-ai/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── graph.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── pdf_generator.py
│   │
│   ├── requirements.txt
│   ├── test_graph.py
│   └── complaint_report.pdf
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── store.js
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Pranjali-0712/complaint-management-ai.git
cd complaint-management-ai
```

### 2. Backend Setup

Create and activate a Python virtual environment.

#### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install the backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file inside the `backend` directory.

Add the required API keys and configuration values used by the application.

**Do not commit `.env` to GitHub.**

The repository already includes `.gitignore` to prevent sensitive environment variables from being uploaded.

### 4. Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The FastAPI server will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will provide a local development URL, normally:

```text
http://localhost:5173
```

## 🧪 Testing

Backend tests can be executed using:

```bash
cd backend
pytest
```

The project includes:

```text
backend/test_graph.py
```

for testing the complaint-processing workflow.

## 🔐 Security

Sensitive configuration files such as `.env` are excluded from Git using `.gitignore`.

Never upload:

* API keys
* Passwords
* Authentication tokens
* Private credentials
* Local virtual environments

## 🔮 Future Enhancements

Possible future improvements include:

* User authentication and role-based access
* Email notifications for high-risk complaints
* Advanced analytics and visualizations
* Multi-language complaint processing
* Voice-based complaint submission
* Complaint priority prediction
* Cloud deployment
* Automated customer response generation
* Admin management panel

## 👩‍💻 Author

**Pranjali Tiwari**

Computer Science & Engineering

GitHub:
https://github.com/Pranjali-0712

## ⭐ Project Purpose

This project demonstrates the practical application of:

* Generative AI
* LangGraph
* FastAPI
* React
* Workflow orchestration
* Database management
* PDF report generation
* Full-stack application development

It was developed as a practical AI/full-stack project to automate and improve the customer complaint management process.
