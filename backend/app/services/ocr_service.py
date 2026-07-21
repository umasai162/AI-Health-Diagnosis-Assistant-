import os
import logging

logger = logging.getLogger(__name__)

def process_document(file_path: str, filename: str) -> str:
    """
    Detects file type and processes it with the appropriate OCR service.
    """
    ext = os.path.splitext(filename)[1].lower()
    
    try:
        if ext == '.pdf':
            logger.info(f"Processing PDF: {filename}")
            from app.services.pdf_reader import extract_pdf_text
            return extract_pdf_text(file_path)
        elif ext in ['.png', '.jpg', '.jpeg']:
            logger.info(f"Processing Image: {filename}")
            from app.services.image_reader import extract_image_text
            return extract_image_text(file_path)
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
    except Exception as e:
        logger.error(f"Failed to process document {filename}: {str(e)}")
        raise e

