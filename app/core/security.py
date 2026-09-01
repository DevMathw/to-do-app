"""
Hashing de contraseñas, emisión y verificación de JWT, y la dependencia
que resuelve el usuario autenticado de cada petición.
"""

from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# bcrypt opera sobre los primeros 72 bytes y descarta el resto en silencio.
# Se trunca aquí de forma explícita para que el comportamiento sea visible
# y coincida con el límite declarado en UserCreate.
BCRYPT_MAX_BYTES = 72

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No se pudo validar las credenciales",
    headers={"WWW-Authenticate": "Bearer"},
)


def _truncate(password: str) -> bytes:
    return password.encode("utf-8")[:BCRYPT_MAX_BYTES]


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt(rounds=settings.bcrypt_rounds)
    return bcrypt.hashpw(_truncate(password), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_truncate(plain_password), hashed_password.encode("utf-8"))
    except ValueError:
        # Hash con formato inválido en la base de datos: se trata como fallo
        # de autenticación, nunca como un 500.
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def verify_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except InvalidTokenError:
        # `from None` corta la traza original: el detalle de por qué el token
        # es inválido no debe llegar al cliente ni confundirse con un bug.
        raise credentials_exception from None

    username = payload.get("sub")
    if not username:
        raise credentials_exception
    return TokenData(username=username)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    token_data = verify_token(token)
    user = db.query(User).filter(User.username == token_data.username).first()

    # Mismo 401 que un token inválido: un usuario borrado con un token válido
    # no debe distinguirse de un token corrupto.
    if user is None or not user.is_active:
        raise credentials_exception
    return user
