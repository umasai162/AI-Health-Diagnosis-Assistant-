"""
Vector Store Service
Manages ChromaDB persistent client for storing and searching report embeddings.
Each report's chunks are stored with metadata for filtering.
"""

import chromadb
import logging
from app.config import CHROMA_DB_PATH
from app.services.embedding_service import get_embeddings

logger = logging.getLogger(__name__)

# Initialize ChromaDB persistent client
_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

# Single collection for all reports — filter by report_id metadata
COLLECTION_NAME = "medical_reports"


def _get_collection():
    """Get or create the medical reports collection."""
    return _client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )


def store_report_chunks(report_id: int, chunks: list[str]) -> None:
    """
    Embed and store text chunks for a given report.
    Each chunk gets a unique id: report_{report_id}_chunk_{i}
    """
    if not chunks:
        logger.warning(f"No chunks to store for report {report_id}")
        return

    collection = _get_collection()
    embeddings = get_embeddings(chunks)

    ids = [f"report_{report_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"report_id": str(report_id), "chunk_index": i} for i in range(len(chunks))]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    logger.info(f"Stored {len(chunks)} chunks for report {report_id}")


def search_similar(report_id: int, query: str, top_k: int = 5) -> list[str]:
    """
    Search for the most relevant chunks for a query, scoped to a specific report.
    Returns a list of document strings.
    """
    collection = _get_collection()
    query_embedding = get_embeddings([query])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"report_id": str(report_id)},
    )

    documents = results.get("documents", [[]])[0]
    return documents


def delete_report_chunks(report_id: int) -> None:
    """Delete all chunks associated with a report from ChromaDB."""
    collection = _get_collection()
    try:
        # Get all ids that belong to this report
        results = collection.get(
            where={"report_id": str(report_id)},
        )
        ids = results.get("ids", [])
        if ids:
            collection.delete(ids=ids)
            logger.info(f"Deleted {len(ids)} chunks for report {report_id}")
    except Exception as e:
        logger.error(f"Error deleting chunks for report {report_id}: {e}")
