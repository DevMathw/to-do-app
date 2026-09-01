"""Schemas Pydantic para la validación de tareas."""

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Priority = Literal["high", "med", "low"]
Tag = Literal["work", "personal", "design", "dev"]


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    priority: Priority = "med"
    tag: Tag = "work"
    due_date: date | None = None


class TaskCreate(TaskBase):
    """Alta de tarea. El estado inicial siempre es 'no completada'."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Comprar leche",
                "description": "Ir al supermercado antes de las 6pm",
                "priority": "high",
                "tag": "personal",
                "due_date": "2026-09-15",
            }
        }
    )


class TaskUpdate(BaseModel):
    """
    Actualización parcial: todos los campos son opcionales y solo se aplican
    los enviados explícitamente (se usa con PATCH, no con PUT).
    """

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    completed: bool | None = None
    priority: Priority | None = None
    tag: Tag | None = None
    due_date: date | None = None


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime
    owner_id: int


class TaskPage(BaseModel):
    """
    Respuesta paginada. Devolver `total` permite al cliente construir un
    paginador real; un array plano no lo permite.
    """

    items: list[TaskResponse]
    total: int
    skip: int
    limit: int
