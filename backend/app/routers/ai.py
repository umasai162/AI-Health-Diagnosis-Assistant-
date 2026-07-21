"""
AI Analysis Router
Endpoints for triggering and retrieving AI analysis of medical reports.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.models.analysis import Analysis
from app.services import analysis_service
from app.utils.jwt_handler import get_current_user
from app.schemas.analysis_schema import AnalysisResponse
from app.prompts.medical_prompt import DISCLAIMER

router = APIRouter(
    prefix="/ai",
    tags=["AI Analysis"]
)


@router.post("/analyze/{report_id}")
def analyze_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger RAG-powered AI analysis on an uploaded report.
    The report must belong to the current user.
    """
    # Verify ownership
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    try:
        analysis = analysis_service.analyze_report(db=db, report_id=report_id)
        return {
            "success": True,
            "message": "Report analyzed successfully.",
            "disclaimer": DISCLAIMER,
            "data": {
                "report_id": analysis.report_id,
                "summary": analysis.summary,
                "abnormal_values": analysis.abnormal_values,
                "possible_conditions": analysis.possible_conditions,
                "diet_plan": analysis.diet_plan,
                "lifestyle": analysis.lifestyle,
                "follow_up_tests": analysis.follow_up_tests,
                "doctor_advice": analysis.doctor_advice,
                "emergency": analysis.emergency,
                "english": analysis.english_response,
                "telugu": analysis.telugu_response,
                "created_at": str(analysis.created_at),
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/analysis/{report_id}", response_model=AnalysisResponse)
def get_analysis(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve stored analysis for a report."""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    analysis = db.query(Analysis).filter(Analysis.report_id == report_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found. Please trigger analysis first.")
    return analysis