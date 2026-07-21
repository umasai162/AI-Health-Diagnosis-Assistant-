"""
Analysis Service
Orchestrates report analysis: calls RAG pipeline, stores results in the Analysis table.
"""

import json
import logging
from sqlalchemy.orm import Session
from app.models.analysis import Analysis
from app.models.report import Report
from app.services import rag_service, medgemma_service

logger = logging.getLogger(__name__)


def analyze_report(db: Session, report_id: int) -> Analysis:
    """
    Run RAG-powered analysis on a report and save the structured results.
    Creates a new Analysis record or updates an existing one.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise ValueError(f"Report {report_id} not found")
    if not report.ocr_text:
        raise ValueError(f"Report {report_id} has no OCR text")

    # Index the report text into the RAG vector store for future chat queries
    rag_service.index_report(report_id, report.ocr_text)

    # Run the Gemini AI analysis pipeline to extract structured data
    result = medgemma_service.analyze_report(report.ocr_text)

    # Get or create analysis record
    analysis = db.query(Analysis).filter(Analysis.report_id == report_id).first()
    if not analysis:
        analysis = Analysis(report_id=report_id)
        db.add(analysis)

    # Populate fields from the structured LLM response
    analysis.summary = result.get("summary", "")
    analysis.abnormal_values = result.get("abnormal_values", [])
    analysis.possible_conditions = result.get("possible_conditions", [])
    analysis.diet_plan = result.get("diet_plan", [])
    analysis.lifestyle = result.get("lifestyle", [])
    analysis.follow_up_tests = result.get("follow_up_tests", [])
    analysis.doctor_advice = result.get("doctor_advice", "")
    analysis.emergency = result.get("emergency", False)
    analysis.english_response = result.get("english", "")
    analysis.telugu_response = result.get("telugu", "")

    report.status = "analyzed"
    db.commit()
    db.refresh(analysis)

    logger.info(f"Analysis saved for report {report_id}")
    return analysis