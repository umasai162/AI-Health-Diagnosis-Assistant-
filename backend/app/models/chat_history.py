"""
Chat History Model
Stores conversational Q&A between users and the AI about their reports.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    language = Column(String(10), default="en")  # "en" or "te"
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    report = relationship("Report", back_populates="chat_messages")
    user = relationship("User", back_populates="chat_messages")
