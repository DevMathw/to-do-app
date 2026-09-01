"""
Schemas Pydantic para usuarios y tokens.

Separan la representación pública de la API del modelo de base de datos:
UserResponse no puede exponer el hash porque el campo no existe en el schema.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$")
    email: EmailStr


class UserCreate(UserBase):
    # 8 caracteres como mínimo razonable. bcrypt trunca a 72 bytes, así que
    # se limita arriba para que el usuario no crea que usa más entropía de la real.
    password: str = Field(min_length=8, max_length=72)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "username": "johndoe",
                "email": "john@example.com",
                "password": "un-password-seguro",
            }
        }
    )


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    username: str | None = None
