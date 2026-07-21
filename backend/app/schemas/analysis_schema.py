from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AnalysisResponse(BaseModel):
    id: int
    report_id: int
    summary: Optional[str] = None
    abnormal_values: Optional[List[str]] = None
    possible_conditions: Optional[List[str]] = None
    diet_plan: Optional[List[str]] = None
    lifestyle: Optional[List[str]] = None
    follow_up_tests: Optional[List[str]] = None
    doctor_advice: Optional[str] = None
    emergency: bool = False
    english_response: Optional[str] = None
    telugu_response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True