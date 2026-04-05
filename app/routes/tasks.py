"""
Rutas CRUD para tareas. Todas las rutas requieren autenticación JWT.
Cada usuario solo puede ver y modificar sus propias tareas.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.core.security import get_current_user

router = APIRouter()


def get_task_or_404(task_id: int, current_user: User, db: Session) -> Task:
    """
    Helper reutilizable: busca una tarea por ID y valida que pertenece al usuario actual.
    Lanza 404 si no existe, y 403 si pertenece a otro usuario.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con id {task_id} no encontrada",
        )
    if task.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a esta tarea",
        )
    return task


# ─── CREATE ───────────────────────────────────────────────────────────────────

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crea una nueva tarea para el usuario autenticado."""
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        owner_id=current_user.id,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


# ─── READ ALL ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene todas las tareas del usuario autenticado.
    Soporta paginación con los parámetros skip y limit.
    """
    tasks = (
        db.query(Task)
        .filter(Task.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return tasks


# ─── READ ONE ─────────────────────────────────────────────────────────────────

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtiene una tarea específica por su ID."""
    return get_task_or_404(task_id, current_user, db)


# ─── UPDATE ───────────────────────────────────────────────────────────────────

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Actualiza una tarea. Solo se modifican los campos enviados en el body.
    Permite actualizar título, descripción y/o estado (completado).
    """
    task = get_task_or_404(task_id, current_user, db)

    # Actualizar solo los campos proporcionados (exclude_unset ignora los no enviados)
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


# ─── DELETE ───────────────────────────────────────────────────────────────────

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Elimina una tarea permanentemente. Devuelve 204 sin contenido."""
    task = get_task_or_404(task_id, current_user, db)
    db.delete(task)
    db.commit()
