"""
Voice Service
Handles speech-to-text (SpeechRecognition) and text-to-speech (gTTS).
"""

import io
import logging
import speech_recognition as sr
from gtts import gTTS

logger = logging.getLogger(__name__)


def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    """
    Convert audio file bytes to text using Google Speech Recognition.
    Supports WAV and common audio formats.
    """
    recognizer = sr.Recognizer()

    try:
        audio_file = io.BytesIO(audio_bytes)
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)
        return text
    except sr.UnknownValueError:
        logger.warning("Speech Recognition could not understand the audio")
        return ""
    except sr.RequestError as e:
        logger.error(f"Speech Recognition service error: {e}")
        raise RuntimeError(f"Speech recognition service unavailable: {e}")
    except Exception as e:
        logger.error(f"Audio transcription failed: {e}")
        raise


def synthesize_speech(text: str, language: str = "en") -> bytes:
    """
    Convert text to speech audio bytes using gTTS.
    Returns MP3 bytes.
    """
    lang_code = "te" if language == "te" else "en"

    try:
        tts = gTTS(text=text, lang=lang_code)
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        return audio_buffer.read()
    except Exception as e:
        logger.error(f"Speech synthesis failed: {e}")
        raise
