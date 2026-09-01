"""
Configuración compartida de los tests.

Cada test recibe una base de datos SQLite en memoria completamente limpia,
de modo que el orden de ejecución nunca afecta al resultado.
"""

import os

# Las variables deben existir antes de importar la app: la configuración se
# valida al importarse y aborta si falta SECRET_KEY.
os.environ.setdefault("SECRET_KEY", "clave-de-test-solo-para-pytest-32-bytes-min")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("ENVIRONMENT", "test")
# Coste mínimo de bcrypt: sin esto, hashear contraseñas domina el tiempo de
# la suite (~2 min frente a unos segundos).
os.environ.setdefault("BCRYPT_ROUNDS", "4")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.database.session import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import task, user  # noqa: E402,F401  (registra las tablas)


@pytest.fixture
def db_session():
    # StaticPool mantiene viva la misma conexión en memoria durante el test.
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# --- Utilidades de alto nivel ---------------------------------------------

API = "/api/v1"


def register_and_login(client, username="alice", password="password-de-test"):
    """Crea un usuario y devuelve la cabecera de autorización lista para usar."""
    response = client.post(
        f"{API}/auth/register",
        json={
            "username": username,
            "email": f"{username}@example.com",
            "password": password,
        },
    )
    assert response.status_code == 201, response.text

    token = client.post(
        f"{API}/auth/login",
        data={"username": username, "password": password},
    ).json()["access_token"]

    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers(client):
    return register_and_login(client, "alice")


@pytest.fixture
def other_auth_headers(client):
    """Segundo usuario, para comprobar el aislamiento entre cuentas."""
    return register_and_login(client, "bob")
