from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.utils.jwt_handler import get_current_user
from app.schemas.user_schema import UserProfile, UserUpdate
from app.database import get_db
from app.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserProfile)
def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_data.name is not None:
        current_user.name = user_data.name
    if user_data.phone is not None:
        current_user.phone = user_data.phone
    if user_data.language_preference is not None:
        current_user.language_preference = user_data.language_preference
        
    db.commit()
    db.refresh(current_user)
    return current_user