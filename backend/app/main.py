from io import BytesIO

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader

from .database import ComplaintStore
from .graph import run_complaint_graph
from .models import ChatRequest, SubmitRequest, UpdateRequest 
from .pdf_generator import generate_pdf
from pydantic import BaseModel

class UpdateComplaintRequest(BaseModel):
    complaint: dict

app = FastAPI(title="Complaint Management API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

store = ComplaintStore()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/chat")
def chat(request: ChatRequest):
    extracted = run_complaint_graph(request.message)
    return {"complaint": extracted, "message": "Complaint extracted"}


@app.post("/upload")
def upload(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    try:
        pdf_bytes = file.file.read()
        reader = PdfReader(BytesIO(pdf_bytes))
        extracted_text = "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to read PDF: {exc}") from exc

    extracted = run_complaint_graph(extracted_text)
    return {"complaint": extracted, "message": "PDF content processed"}


@app.post("/update")
def update(request: UpdateRequest):
    if not request.field:
        raise HTTPException(status_code=400, detail="Field is required")
    return {"field": request.field, "value": request.value, "message": "Field updated"}


@app.get("/complaint/{complaint_id}")
def get_complaint(complaint_id: str):
    complaint = store.get(complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint
@app.get("/complaints")
def get_all_complaints():
    return store.get_all()


@app.post("/submit")
def submit(request: SubmitRequest):
    saved = store.create(request.complaint.dict())
    return {"id": saved["id"], "message": "Complaint submitted"}
@app.post("/generate-pdf")
def generate_complaint_pdf(request: SubmitRequest):
    filename = "complaint_report.pdf"

    generate_pdf(
        request.complaint.dict(),
        filename
    )

    return FileResponse(
        path=filename,
        media_type="application/pdf",
        filename="complaint_report.pdf"
    )

@app.get("/dashboard")
def dashboard():
    complaints = store.get_all()

    total = len(complaints)
    high = sum(1 for c in complaints if c["severity"] == "High")
    medium = sum(1 for c in complaints if c["severity"] == "Medium")
    low = sum(1 for c in complaints if c["severity"] == "Low")

    countries = {}

    for c in complaints:
        country = (c.get("country") or "Unknown").strip()

        if country != "Unknown":
            country = country.title()

            countries[country] = countries.get(country, 0) + 1

    return {
        "total": total,
        "high": high,
        "medium": medium,
        "low": low,
        "countries": countries,
    }
@app.delete("/complaint/{complaint_id}")
def delete_complaint(complaint_id: int):
    deleted = store.delete(complaint_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return {"message": "Complaint deleted successfully"}
@app.put("/complaint/{complaint_id}")
def update_complaint(complaint_id: int, request: UpdateComplaintRequest):
    result = store.update(complaint_id, request.complaint)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return result
