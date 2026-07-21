# pyrefly: ignore [missing-import]
import fitz
import logging


logger = logging.getLogger(__name__)

def extract_pdf_text(pdf_path: str):
    try:
        document = fitz.open(pdf_path)
        text = ""
        for page_num in range(len(document)):
            page = document[page_num]
            page_text = page.get_text().strip()
            
            if page_text:
                text += page_text + "\n"
            else:
                # Fallback to EasyOCR for scanned pages
                pix = page.get_pixmap()
                img_data = pix.tobytes("png")
                # write to temp file? No, EasyOCR can take bytes/numpy.
                # easyocr.readtext accepts raw bytes or file path
                try:
                    import easyocr
                    reader = easyocr.Reader(["en", "te"])
                    result = reader.readtext(img_data)
                    for item in result:
                        if item[2] > 0.3:
                            text += item[1] + "\n"
                except Exception as e:
                    logger.warning(f"Failed EasyOCR fallback on page {page_num}: {e}")
        
        document.close()
        return text
    except Exception as e:
        logger.error(f"Error reading PDF {pdf_path}: {e}")
        raise e