"""
indexing_service.py

Automatically indexes OCR text
into ChromaDB.
"""

from app.services.chunking_service import chunk_service
from app.services.embedding_service import embedding_service
from app.services.chroma_service import chroma_service


class IndexingService:

    def index_report(
        self,
        report
    ):

        if not report.ocr_text:

            return

        chunks = chunk_service.split_text(
            report.ocr_text
        )

        texts = [

            chunk["text"]

            for chunk in chunks

        ]

        embeddings = embedding_service.create_embeddings(
            texts
        )

        chroma_service.add_report(

            report_id=report.id,

            user_id=report.user_id,

            chunks=chunks,

            embeddings=embeddings

        )


indexing_service = IndexingService()