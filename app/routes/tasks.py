"""
CRUD de tareas. Todas las rutas exigen autenticación y cada usuario solo
puede ver y modificar las suyas.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import (
    Priority,
    Tag,
    TaskCreate,
    TaskPage,
    TaskResponse,
    TaskUpdate,
)

router = APIRouter()


def get_owned_task(task_id: int, current_user: User, db: Session) -> Task:
    """
    Recupera una tarea comprobando la propiedad.

    Devuelve 404 también cuando la tarea existe pero es de otro usuario: un
    403 confirmaría al atacante que ese id existe.
    """
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con id {task_id} no encontrada",
        )
    return task


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una tarea",
)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(**task_data.model_dump(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=TaskPage, summary="Listar tareas del usuario")
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    completed: bool | None = Query(None, description="Filtrar por estado"),
    priority: Priority | None = Query(None, description="Filtrar por prioridad"),
    tag: Tag | None = Query(None, description="Filtrar por etiqueta"),
    search: str | None = Query(
        None, min_length=1, max_length=100, description="Buscar en título y descripción"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    query = db.query(Task).filter(Task.owner_id == current_user.id)

    if completed is not None:
        query = query.filter(Task.completed.is_(completed))
    if priority is not None:
        query = query.filter(Task.priority == priority)
    if tag is not None:
        query = query.filter(Task.tag == tag)
    if search:
        pattern = f"%{search}%"
        query = query.filter(or_(Task.title.ilike(pattern), Task.description.ilike(pattern)))

    total = query.count()

    # Orden explícito: sin ORDER BY el orden lo decide el motor y cambia al
    # actualizar filas. Se desempata por id para que sea estable.
    items = query.order_by(Task.created_at.desc(), Task.id.desc()).offset(skip).limit(limit).all()

    return TaskPage(items=items, total=total, skip=skip, limit=limit)


@router.get("/{task_id}", response_model=TaskResponse, summary="Obtener una tarea")
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_owned_task(task_id, current_user, db)


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Actualizar parcialmente una tarea",
)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    PATCH y no PUT: solo se aplican los campos enviados, el recurso no se
    reemplaza por completo.
    """
    task = get_owned_task(task_id, current_user, db)

    updates = task_data.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se envió ningún campo para actualizar",
        )

    for field, value in updates.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar una tarea",
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_owned_task(task_id, current_user, db)
    db.delete(task)
    db.commit()
