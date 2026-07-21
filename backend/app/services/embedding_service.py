import logging
from google import genai
from app.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables")

try:
    client = genai.Client(api_key=GEMINI_API_KEY)
except Exception as e:
    logger.error(f"Failed to initialize GenAI client: {e}")
    client = None

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generates embeddings for a list of strings using Google Gemini API.
    """
    if not client:
        raise RuntimeError("GenAI client is not initialized")
    
    if not texts:
        return []

    try:
        response = client.models.embed_content(
            model="models/gemini-embedding-2",
            contents=texts
        )
        return [emb.values for emb in response.embeddings]
    except Exception as e:
        logger.error(f"Failed to generate embeddings via Gemini: {e}")
        raise e

# Compatibility wrappers for different imports in indexing/retrieval services
def create_embeddings(texts: list[str]) -> list[list[float]]:
    return get_embeddings(texts)

def create_embedding(text: str) -> list[float]:
    res = get_embeddings([text])
    return res[0] if res else []