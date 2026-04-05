"""
Modelo ORM para la tabla de tareas.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.session import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Clave foránea: cada tarea pertenece a un usuario
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relación inversa con el usuario
    owner = relationship("User", back_populates="tasks")
