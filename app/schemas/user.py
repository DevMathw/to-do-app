"""
Schemas Pydantic para validación de datos de usuario.
Separan la representación de la API del modelo de base de datos.
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, example="johndoe")
    email: EmailStr = Field(..., example="john@example.com")


class UserCreate(UserBase):
    """Schema para registrar un nuevo usuario. Incluye la contraseña en texto plano."""
    password: str = Field(..., min_length=6, example="secretpassword")


class UserResponse(UserBase):
    """Schema de respuesta. Nunca expone la contraseña hasheada."""
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Permite convertir modelos ORM a Pydantic


class Token(BaseModel):
    """Schema para la respuesta del token JWT."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Datos contenidos dentro del JWT (payload)."""
    username: Optional[str] = None
