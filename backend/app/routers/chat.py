from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.models.chat_history import ChatHistory
from app.schemas.chat_schema import ChatMessageRequest
from app.services.chat_service import chat_service
from app.utils.jwt_handler import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["RAG Chat"]
)


@router.post("/{report_id}")
def ask_question(
    report_id: int,
    request: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership of report
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or access denied")

    return chat_service.ask_question(
        db=db,
        user_id=current_user.id,
        report_id=report_id,
        question=request.question,
        language=request.language
    )


@router.get("/{report_id}/history")
def get_chat_history(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership of report
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or access denied")

    history = db.query(ChatHistory).filter(
        ChatHistory.report_id == report_id,
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.created_at.asc()).all()
    
    return history