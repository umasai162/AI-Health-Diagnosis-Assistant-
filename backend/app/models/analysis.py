"""
Analysis Model
Stores structured AI analysis results for each medical report.
JSON fields store arrays (abnormal values, conditions, diet, etc.).
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, unique=True, index=True)

    # Structured analysis fields
    summary = Column(Text, nullable=True)
    abnormal_values = Column(JSON, nullable=True)       # List of abnormal lab values
    possible_conditions = Column(JSON, nullable=True)    # List of possible conditions
    diet_plan = Column(JSON, nullable=True)              # List of diet recommendations
    lifestyle = Column(JSON, nullable=True)              # List of lifestyle improvements
    follow_up_tests = Column(JSON, nullable=True)        # List of follow-up tests
    doctor_advice = Column(Text, nullable=True)
    emergency = Column(Boolean, default=False)

    # Multilingual responses
    english_response = Column(Text, nullable=True)
    telugu_response = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    # Relationship
    report = relationship("Report", back_populates="analysis")
