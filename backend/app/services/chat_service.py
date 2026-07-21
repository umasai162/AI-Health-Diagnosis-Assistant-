"""
Handles RAG Chat
"""

from sqlalchemy.orm import Session

from app.models.chat_history import ChatHistory
from app.services.rag_service import rag_service


class ChatService:

    def ask_question(
        self,
        db: Session,
        user_id: int,
        report_id: int,
        question: str,
        language: str = "en"
    ):

        response = rag_service.answer_question(
            report_id=report_id,
            question=question,
            language=language
        )

        answer = response["answer"]

        chat = ChatHistory(
            report_id=report_id,
            user_id=user_id,
            question=question,
            answer=answer,
            language=language
        )

        db.add(chat)
        db.commit()

        return {
            "answer": answer
        }


chat_service = ChatService()