"""Tests de la configuración: normalización de URL y validación de secretos."""

import pytest
from pydantic import ValidationError

from app.core.config import Settings

CLAVE = "una-clave-de-al-menos-32-caracteres-para-test"


@pytest.mark.parametrize(
    "entrada,esperada",
    [
        # Render y Heroku entregan la cadena con este esquema, que SQLAlchemy
        # 2.0 ya no reconoce.
        ("postgres://u:p@host:5432/db", "postgresql+psycopg://u:p@host:5432/db"),
        # Sin driver explícito, SQLAlchemy buscaría psycopg2, que no instalamos.
        ("postgresql://u:p@host:5432/db", "postgresql+psycopg://u:p@host:5432/db"),
        # Ya normalizada: se deja intacta.
        ("postgresql+psycopg://u:p@host:5432/db", "postgresql+psycopg://u:p@host:5432/db"),
        # SQLite no se toca.
        ("sqlite:///./todo.db", "sqlite:///./todo.db"),
    ],
)
def test_normaliza_la_url_de_base_de_datos(entrada, esperada):
    assert Settings(secret_key=CLAVE, database_url=entrada).database_url == esperada


def test_sin_secret_key_la_configuracion_falla(monkeypatch):
    """La app debe negarse a arrancar, no usar una clave por defecto."""
    monkeypatch.delenv("SECRET_KEY", raising=False)

    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_rechaza_una_secret_key_demasiado_corta():
    with pytest.raises(ValidationError):
        Settings(secret_key="corta")


def test_cors_origins_se_parte_por_comas():
    settings = Settings(
        secret_key=CLAVE,
        cors_origins="https://ejemplo.com, http://localhost:5173 ",
    )

    assert settings.allowed_origins == ["https://ejemplo.com", "http://localhost:5173"]


def test_is_sqlite_distingue_el_motor():
    assert Settings(secret_key=CLAVE, database_url="sqlite:///./x.db").is_sqlite
    assert not Settings(secret_key=CLAVE, database_url="postgres://u:p@h/db").is_sqlite
