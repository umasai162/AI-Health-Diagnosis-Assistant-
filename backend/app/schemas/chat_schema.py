from pydantic import BaseModel

class ChatRequest(BaseModel):
    report_id: int
    question: str
    language: str = "en"

class ChatMessageRequest(BaseModel):
    question: str
    language: str = "en"

class ChatResponse(BaseModel):
    answer: str