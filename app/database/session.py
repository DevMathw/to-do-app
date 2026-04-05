"""
Configuración de la base de datos SQLite con SQLAlchemy.
Define el engine, sesión y Base declarativa.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de conexión a SQLite. El archivo todo.db se crea automáticamente.
SQLALCHEMY_DATABASE_URL = "sqlite:///./todo.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # check_same_thread=False es necesario para SQLite con FastAPI (multihilo)
    connect_args={"check_same_thread": False},
)

# Fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos ORM
Base = declarative_base()


def get_db():
    """
    Dependency injection de la sesión de base de datos.
    Garantiza que la sesión se cierre al finalizar la petición.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
