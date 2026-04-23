"""
Auth Routes
===========
POST /auth/register  — create new account
POST /auth/login     — email/password login → JWT
POST /auth/google    — Google OAuth → JWT
GET  /auth/me        — get current user from token
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.services.auth import (
    create_access_token, verify_token,
    get_user_by_email, get_user_by_google_id,
    create_user, authenticate_user, update_last_login,
)

router = APIRouter()


# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    name:     Optional[str] = ""
    company:  Optional[str] = ""

class LoginRequest(BaseModel):
    email:    str
    password: str

class GoogleAuthRequest(BaseModel):
    access_token: str  # Google OAuth access token from frontend

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user: dict


# ─────────────────────────────────────────────
# REGISTER
# ─────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # check if email already exists
    if get_user_by_email(db, req.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters."
        )

    user = create_user(
        db=db,
        email=req.email,
        name=req.name,
        company=req.company,
        password=req.password,
    )

    token = create_access_token({"sub": user.id, "email": user.email})
    update_last_login(db, user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id":      user.id,
            "email":   user.email,
            "name":    user.name,
            "company": user.company,
        }
    }


# ─────────────────────────────────────────────
# LOGIN
# ─────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.email, req.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": user.id, "email": user.email})
    update_last_login(db, user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id":      user.id,
            "email":   user.email,
            "name":    user.name,
            "company": user.company,
        }
    }


# ─────────────────────────────────────────────
# GOOGLE AUTH
# ─────────────────────────────────────────────

@router.post("/google", response_model=TokenResponse)
async def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Receives Google access token from frontend,
    fetches user info from Google, creates/finds user,
    returns our JWT.
    """
    import httpx

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {req.access_token}"},
                timeout=10,
            )
            resp.raise_for_status()
            google_user = resp.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token."
        )

    google_id = google_user.get("sub")
    email     = google_user.get("email")
    name      = google_user.get("name", "")

    if not email or not google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve email from Google."
        )

    # find or create user
    user = get_user_by_google_id(db, google_id)
    if not user:
        user = get_user_by_email(db, email)
        if user:
            # existing email account — link Google
            user.google_id  = google_id
            user.is_verified = True
            db.commit()
        else:
            # brand new user
            user = create_user(
                db=db,
                email=email,
                name=name,
                google_id=google_id,
            )

    token = create_access_token({"sub": user.id, "email": user.email})
    update_last_login(db, user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id":      user.id,
            "email":   user.email,
            "name":    user.name or name,
            "company": user.company,
        }
    }


# ─────────────────────────────────────────────
# GET CURRENT USER
# ─────────────────────────────────────────────

@router.get("/me")
async def get_me(
    authorization: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = get_user_by_email(db, payload.get("email"))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id":         user.id,
        "email":      user.email,
        "name":       user.name,
        "company":    user.company,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }