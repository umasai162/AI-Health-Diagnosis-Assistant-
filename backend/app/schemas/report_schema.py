from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ReportUploadResponse(BaseModel):
    id: int
    filename: str
    status: str
    message: str

class ReportResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    filepath: str
    ocr_text: Optional[str] = None
    created_at: datetime
    status: str

    class Config:
        from_attributes = True

class ReportListResponse(BaseModel):
    reports: List[ReportResponse]
