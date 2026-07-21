"""
Report Model
Stores uploaded medical reports and their OCR-extracted text.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    report_type = Column(String(100), nullable=True)  # blood_test, cbc, mri, xray, etc.
    ocr_text = Column(Text, nullable=True)
    status = Column(String(50), default="uploaded")  # uploaded, processing, analyzed, error
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="reports")
    analysis = relationship("Analysis", back_populates="report", uselist=False, cascade="all, delete-orphan")
    chat_messages = relationship("ChatHistory", back_populates="report", cascade="all, delete-orphan")