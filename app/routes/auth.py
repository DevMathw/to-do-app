"""Rutas de autenticación: registro, login y perfil del usuario actual."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserResponse

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo usuario",
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(User)
        .filter(or_(User.username == user_data.username, User.email == user_data.email))
        .first()
    )
    if existing:
        # Se distingue el campo en conflicto porque el registro ya revela
        # necesariamente si un usuario existe: ocultarlo aquí solo empeora
        # la usabilidad sin aportar seguridad real.
        field = "nombre de usuario" if existing.username == user_data.username else "email"
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ese {field} ya está registrado",
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token, summary="Obtener un token de acceso")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == form_data.username).first()

    # Mismo mensaje para usuario inexistente y contraseña incorrecta: el
    # error no debe revelar qué usuarios existen.
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return Token(
        access_token=create_access_token(data={"sub": user.username}),
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Perfil del usuario autenticado",
)
def read_me(current_user: User = Depends(get_current_user)):
    """
    Permite al cliente validar un token guardado al arrancar, en lugar de
    confiar en lo que haya en localStorage.
    """
    return current_user
