"""
Voice Router
Endpoints for speech-to-text and text-to-speech.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
import io
from app.models.user import User
from app.utils.jwt_handler import get_current_user
from app.services.voice_service import transcribe_audio, synthesize_speech

router = APIRouter(
    prefix="/voice",
    tags=["Voice"]
)


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload an audio file and get the transcribed text.
    Accepts WAV format.
    """
    try:
        audio_bytes = await audio.read()
        text = transcribe_audio(audio_bytes, audio.filename)
        if not text:
            raise HTTPException(status_code=400, detail="Could not transcribe audio. Please try again.")
        return {"text": text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/synthesize")
def synthesize(
    text: str,
    language: str = "en",
    current_user: User = Depends(get_current_user),
):
    """
    Convert text to speech. Returns an MP3 audio stream.
    Supports 'en' (English) and 'te' (Telugu).
    """
    try:
        audio_bytes = synthesize_speech(text, language)
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")
