from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.utils.password import verify_password, hash_password
from app.utils.jwt_handler import create_access_token, get_current_user
from app.schemas.user_schema import UserLogin, UserCreate, PasswordReset, UserResponse
from app.database import get_db
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid Email")
    if not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid Password")

    token = create_access_token(data={"sub": existing_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": existing_user.id,
            "name": existing_user.name,
            "email": existing_user.email,
            "language_preference": existing_user.language_preference
        }
    }

@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    # Since email server is not configured in this plan yet, we'll return a simple response.
    # In a real scenario, this would send an email with a reset token.
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "If the email is registered, a password reset link has been sent."}

@router.post("/change-password")
def change_password(
    data: PasswordReset,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.old_password, current_user.password):
        raise HTTPException(status_code=400, detail="Invalid old password")
    
    current_user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}