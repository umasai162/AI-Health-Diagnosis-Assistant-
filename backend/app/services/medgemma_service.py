"""
MedGemma Service
Handles all interactions with Google Gemini API for medical report analysis and chat.
Uses structured prompts and returns parsed JSON for analysis, plain text for chat.
"""

import json
import re
import logging
import time
from google import genai
from app.config import GEMINI_API_KEY, MODEL_NAME
from app.prompts.medical_prompt import ANALYSIS_PROMPT, CHAT_PROMPT, TELUGU_TRANSLATION_PROMPT

logger = logging.getLogger(__name__)

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables")

client = genai.Client(api_key=GEMINI_API_KEY)


def _call_gemini(prompt: str, max_retries: int = 3) -> str:
    """
    Call the Gemini API with retry logic.
    Returns the raw text response.
    """
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
            )
            return response.text
        except Exception as e:
            logger.warning(f"Gemini API call failed (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                raise


def _parse_json_response(text: str) -> dict:
    """
    Parse a JSON response from the LLM.
    Handles cases where the LLM wraps JSON in markdown code fences.
    """
    # Strip markdown code fences if present
    cleaned = text.strip()
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to find JSON object in the text
        match = re.search(r'\{[\s\S]*\}', cleaned)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        logger.error(f"Failed to parse JSON from Gemini response: {cleaned[:200]}...")
        # Return a fallback structure
        return {
            "summary": cleaned,
            "abnormal_values": [],
            "possible_conditions": [],
            "diet_plan": [],
            "lifestyle": [],
            "follow_up_tests": [],
            "doctor_advice": "Please consult a healthcare professional for proper analysis.",
            "emergency": False,
            "english": cleaned,
            "telugu": "",
        }


def analyze_report(report_text: str, context_chunks: list[str] = None) -> dict:
    """
    Analyze a medical report using Gemini with structured prompt.
    Returns a parsed dictionary matching the analysis schema.
    """
    context = "\n\n".join(context_chunks) if context_chunks else "No additional context available."
    prompt = ANALYSIS_PROMPT.format(report_text=report_text, context=context)
    raw_response = _call_gemini(prompt)
    return _parse_json_response(raw_response)


def answer_question(question: str, context: str, language: str = "en") -> str:
    """
    Answer a user question about their report using RAG context.
    Returns plain text answer.
    """
    language_name = "Telugu" if language == "te" else "English"
    prompt = CHAT_PROMPT.format(
        context=context,
        question=question,
        language_name=language_name,
    )
    return _call_gemini(prompt)


def translate_to_telugu(text: str) -> str:
    """Translate text to Telugu using Gemini."""
    prompt = TELUGU_TRANSLATION_PROMPT.format(text=text)
    return _call_gemini(prompt)