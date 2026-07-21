import os
import shutil
from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.report import Report
from app.models.user import User
from app.services.ocr_service import process_document
from app.services import rag_service
from app.utils.jwt_handler import get_current_user
from app.schemas.report_schema import ReportResponse, ReportListResponse, ReportUploadResponse

router = APIRouter(
    prefix="/reports",
    tags=["Medical Reports"]
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}

@router.post("/upload", response_model=ReportUploadResponse)
async def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    extension = file.filename.split(".")[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    ocr_text = process_document(filepath, file.filename)
    if not ocr_text:
        raise HTTPException(status_code=400, detail="Unable to extract text from report.")

    report = Report(
        user_id=current_user.id,
        filename=file.filename,
        filepath=filepath,
        ocr_text=ocr_text,
        status="uploaded"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Index report text into ChromaDB for RAG
    rag_service.index_report(report.id, ocr_text)

    return ReportUploadResponse(
        id=report.id,
        filename=report.filename,
        status=report.status,
        message="Report uploaded and OCR completed successfully."
    )

@router.get("/", response_model=ReportListResponse)
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reports = db.query(Report).filter(Report.user_id == current_user.id).all()
    return ReportListResponse(reports=reports)

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Delete file from filesystem
    if os.path.exists(report.filepath):
        os.remove(report.filepath)

    # Clean up vector store
    rag_service.remove_report(report_id)

    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}