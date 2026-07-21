"""
retrieval_service.py

Retrieves relevant medical report chunks
from ChromaDB for RAG.
"""

from typing import List

from app.services.embedding_service import embedding_service
from app.services.chroma_service import chroma_service


class RetrievalService:

    def retrieve_context(
        self,
        question: str,
        report_id: int,
        top_k: int = 5
    ) -> List[str]:
        """
        Retrieve the most relevant chunks
        from ChromaDB.
        """

        query_embedding = embedding_service.create_embedding(
            question
        )

        results = chroma_service.search(
            query_embedding=query_embedding,
            report_id=report_id,
            top_k=top_k
        )

        if not results:
            return []

        documents = results.get("documents", [])

        if not documents:
            return []

        return documents[0]

    def build_context(
        self,
        question: str,
        report_id: int
    ) -> str:
        """
        Combine retrieved chunks into
        one context string.
        """

        chunks = self.retrieve_context(
            question,
            report_id
        )

        if not chunks:
            return ""

        return "\n\n".join(chunks)


retrieval_service = RetrievalService()