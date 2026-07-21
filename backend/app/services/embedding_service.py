import logging
from google import genai
from app.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# Lazy client — initialized on first use so the server can start without the key
_client = None


def _get_client():
    """Return a cached Gemini client, creating it on first call."""
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Add it in your Render environment variables."
            )
        try:
            _client = genai.Client(api_key=GEMINI_API_KEY)
        except Exception as e:
            logger.error(f"Failed to initialize GenAI client: {e}")
            raise
    return _client

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generates embeddings for a list of strings using Google Gemini API.
    """
    if not texts:
        return []

    client = _get_client()
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