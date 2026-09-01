"""
Configuración de la aplicación.

Todos los valores se leen del entorno (o de un archivo .env en desarrollo).
SECRET_KEY no tiene valor por defecto a propósito: si falta, la app no arranca.
Es preferible un fallo ruidoso al arrancar que firmar tokens con una clave
conocida públicamente.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Seguridad ---------------------------------------------------------
    # Sin default: la ausencia de esta variable debe impedir el arranque.
    secret_key: str = Field(min_length=32)
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Coste de bcrypt. 12 es el valor recomendado en producción; los tests lo
    # bajan al mínimo porque, si no, hashear domina el tiempo de la suite.
    bcrypt_rounds: int = Field(default=12, ge=4, le=16)

    # --- Base de datos -----------------------------------------------------
    # SQLite solo para desarrollo local. En producción se inyecta la URL de
    # PostgreSQL por entorno (ver docker-compose.yml y README).
    database_url: str = "sqlite:///./todo.db"

    # --- CORS --------------------------------------------------------------
    # Lista blanca explícita, separada por comas. Nunca "*": la API se
    # consume con credenciales y el comodín no es válido en ese caso.
    # Se declara como str porque pydantic-settings intentaría interpretar
    # una lista del .env como JSON.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- Metadatos ---------------------------------------------------------
    environment: str = "development"

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    """
    Cacheada para que la validación ocurra una sola vez por proceso y para
    poder sobreescribirla en los tests.
    """
    return Settings()


settings = get_settings()
