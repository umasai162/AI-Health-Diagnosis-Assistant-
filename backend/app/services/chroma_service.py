"""
ChromaDB Service

Stores medical report chunks and embeddings.

Collection:
medical_reports
"""

from typing import List, Dict

import chromadb

from app.config import CHROMA_DB_PATH


class ChromaService:

    def __init__(self):

        self.client = chromadb.PersistentClient(
            path=CHROMA_DB_PATH
        )

        self.collection = self.client.get_or_create_collection(
            name="medical_reports"
        )

    # -----------------------------------
    # Store Report Chunks
    # -----------------------------------

    def add_report(
        self,
        report_id: int,
        user_id: int,
        chunks: List[Dict],
        embeddings: List[List[float]]
    ):

        ids = []

        documents = []

        metadatas = []

        vectors = []

        for chunk, embedding in zip(chunks, embeddings):

            ids.append(
                f"{report_id}_{chunk['chunk_id']}"
            )

            documents.append(
                chunk["text"]
            )

            vectors.append(
                embedding
            )

            metadatas.append(
                {
                    "report_id": report_id,
                    "user_id": user_id,
                    "chunk_id": chunk["chunk_id"]
                }
            )

        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=vectors,
            metadatas=metadatas
        )

    # -----------------------------------
    # Similarity Search
    # -----------------------------------

    def search(
        self,
        query_embedding: List[float],
        report_id: int,
        top_k: int = 5
    ):

        results = self.collection.query(

            query_embeddings=[query_embedding],

            n_results=top_k,

            where={
                "report_id": report_id
            }

        )

        return results

    # -----------------------------------
    # Delete Report
    # -----------------------------------

    def delete_report(
        self,
        report_id: int
    ):

        self.collection.delete(

            where={
                "report_id": report_id
            }

        )

    # -----------------------------------
    # Count
    # -----------------------------------

    def count(self):

        return self.collection.count()


chroma_service = ChromaService()