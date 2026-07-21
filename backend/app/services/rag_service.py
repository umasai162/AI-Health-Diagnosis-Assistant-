"""
RAG Service
Handles indexing report text and querying context using ChromaDB and Google Gemini.
"""

import logging
from app.services.chunking_service import chunk_text
from app.services import vector_store, medgemma_service

logger = logging.getLogger(__name__)


def index_report(report_id: int, text: str) -> None:
    """
    Split text into chunks, generate embeddings, and store them in ChromaDB.
    """
    logger.info(f"Indexing report {report_id}")
    try:
        chunks = chunk_text(text)
        vector_store.store_report_chunks(report_id, chunks)
        logger.info(f"Report {report_id} indexed successfully")
    except Exception as e:
        logger.error(f"Failed to index report {report_id}: {e}")
        raise e


def retrieve_context(report_id: int, query: str, top_k: int = 5) -> str:
    """
    Retrieve matching context chunks from ChromaDB.
    """
    logger.info(f"Retrieving context for report {report_id}")
    try:
        chunks = vector_store.search_similar(report_id, query, top_k=top_k)
        if not chunks:
            return "No relevant context found in report."
        return "\n\n".join(chunks)
    except Exception as e:
        logger.error(f"Failed to retrieve context for report {report_id}: {e}")
        return "Error retrieving report context."


def remove_report(report_id: int) -> None:
    """
    Clean up chunks associated with a report.
    """
    logger.info(f"Removing report {report_id} from vector store")
    vector_store.delete_report_chunks(report_id)


def answer_question(report_id: int, question: str, language: str = "en") -> dict:
    """
    Generates an answer to a question using retrieved report context and Gemini.
    """
    logger.info(f"Answering question for report {report_id}")
    context = retrieve_context(report_id, question)
    answer = medgemma_service.answer_question(question, context, language)
    return {"answer": answer}


def query_report(report_id: int, question: str, language: str = "en") -> str:
    """
    Compatibility function.
    """
    res = answer_question(report_id, question, language)
    return res["answer"]


# Class wrapper for services importing the instantiated service object
class RAGService:
    def index_report(self, report_id: int, text: str) -> None:
        return index_report(report_id, text)

    def retrieve_context(self, report_id: int, query: str, top_k: int = 5) -> str:
        return retrieve_context(report_id, query, top_k)

    def remove_report(self, report_id: int) -> None:
        return remove_report(report_id)

    def answer_question(self, report_id: int, question: str, language: str = "en") -> dict:
        return answer_question(report_id, question, language)

    def query_report(self, report_id: int, question: str, language: str = "en") -> str:
        return query_report(report_id, question, language)


rag_service = RAGService()