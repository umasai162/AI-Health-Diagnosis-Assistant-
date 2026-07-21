"""
Models Package
Import all models here so SQLAlchemy can discover them for table creation.
"""

from app.models.user import User                  # noqa: F401
from app.models.report import Report              # noqa: F401
from app.models.analysis import Analysis          # noqa: F401
from app.models.chat_history import ChatHistory    # noqa: F401
