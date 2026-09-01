"""Modelo ORM para la tabla de tareas."""

from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base

# Valores admitidos. Se validan en los schemas Pydantic en lugar de con un
# ENUM nativo: los tipos ENUM de PostgreSQL requieren una migración para
# cada valor nuevo, y aquí la lista cambia con el producto.
PRIORITIES = ("high", "med", "low")
TAGS = ("work", "personal", "design", "dev")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Campos que la interfaz ya mostraba y que ahora sí se persisten.
    priority: Mapped[str] = mapped_column(String(8), default="med", nullable=False)
    tag: Mapped[str] = mapped_column(String(16), default="work", nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Índice explícito: todas las consultas de tareas filtran por propietario.
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    owner = relationship("User", back_populates="tasks")

    def __repr__(self) -> str:  # pragma: no cover - ayuda de depuración
        return f"<Task id={self.id} title={self.title!r} owner_id={self.owner_id}>"
