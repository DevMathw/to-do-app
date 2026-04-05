"""
Schemas Pydantic para validación de datos de tareas.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, example="Comprar leche")
    description: Optional[str] = Field(None, example="Ir al supermercado antes de las 6pm")


class TaskCreate(TaskBase):
    """Schema para crear una tarea. El estado inicial siempre es 'no completado'."""
    pass


class TaskUpdate(BaseModel):
    """
    Schema para actualizar una tarea. Todos los campos son opcionales
    para permitir actualizaciones parciales (PATCH-style).
    """
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    completed: Optional[bool] = None


class TaskResponse(TaskBase):
    """Schema de respuesta completo para una tarea."""
    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime
    owner_id: int

    class Config:
        from_attributes = True
