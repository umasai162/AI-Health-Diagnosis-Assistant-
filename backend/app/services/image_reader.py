import logging

logger = logging.getLogger(__name__)

# Lazy-load EasyOCR reader to avoid crashing on startup if torch has issues
_reader = None
_reader_init_attempted = False


def _get_reader():
    """Lazy-initialize the EasyOCR reader on first use."""
    global _reader, _reader_init_attempted
    if _reader_init_attempted:
        return _reader
    _reader_init_attempted = True
    try:
        import easyocr
        _reader = easyocr.Reader(["en", "te"])
        logger.info("EasyOCR reader initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize EasyOCR: {str(e)}")
        _reader = None
    return _reader


def extract_image_text(image_path: str):
    reader = _get_reader()
    if not reader:
        raise RuntimeError("EasyOCR reader not initialized. Check torch installation.")

    try:
        result = reader.readtext(image_path)
        text = ""
        for item in result:
            # item is (bbox, text, confidence)
            confidence = item[2]
            if confidence > 0.3:  # simple confidence filtering
                text += item[1] + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from image {image_path}: {str(e)}")
        raise e