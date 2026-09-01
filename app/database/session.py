"""
Configuración de la base de datos con SQLAlchemy.

El motor se elige por la variable DATABASE_URL: SQLite en desarrollo,
PostgreSQL en producción. El esquema NO se crea aquí — lo gestiona Alembic.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# check_same_thread solo aplica a SQLite; PostgreSQL no acepta ese argumento.
_connect_args = {"check_same_thread": False} if settings.is_sqlite else {}

engine = create_engine(
    settings.database_url,
    connect_args=_connect_args,
    # pool_pre_ping evita servir conexiones muertas tras un reinicio de la BD,
    # algo habitual en instancias gestionadas que se suspenden por inactividad.
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base declarativa para los modelos ORM."""


def get_db():
    """Inyecta una sesión por petición y garantiza su cierre."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
