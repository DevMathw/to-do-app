"""
Punto de entrada de la API.

Registra routers, CORS, manejadores de error y el health check.
El esquema de la base de datos lo gestiona Alembic, no `create_all`.
"""

import logging
import time
import uuid

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.database.session import engine
from app.routes import auth, tasks

logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}',
)
logger = logging.getLogger("todo-api")

API_PREFIX = "/api/v1"

app = FastAPI(
    title="Todo API",
    description=(
        "API de gestión de tareas con autenticación JWT y aislamiento por usuario.\n\n"
        "Cada usuario solo puede leer y modificar sus propias tareas."
    ),
    version="2.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def add_request_context(request: Request, call_next):
    """
    Asigna un id a cada petición y lo devuelve en la respuesta, para poder
    correlacionar un error del cliente con su línea de log.
    """
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    started = time.perf_counter()

    response = await call_next(request)

    elapsed_ms = (time.perf_counter() - started) * 1000
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "%s %s -> %s (%.1fms) request_id=%s",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
        request_id,
    )
    return response


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Frame-Options"] = "DENY"
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Normaliza los errores de validación a `{"detail": "<texto>"}`.

    Por defecto FastAPI devuelve una lista de objetos aquí y un string en el
    resto de errores; esa inconsistencia obligaba al cliente a tratar dos
    formatos distintos.
    """
    first = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(part) for part in first.get("loc", []) if part != "body")
    message = first.get("msg", "Datos inválidos")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": f"{field}: {message}" if field else message},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Evita filtrar trazas al cliente, pero las deja completas en el log."""
    logger.exception("Error no controlado en %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Error interno del servidor"},
    )


app.include_router(auth.router, prefix=f"{API_PREFIX}/auth", tags=["Autenticación"])
app.include_router(tasks.router, prefix=f"{API_PREFIX}/tasks", tags=["Tareas"])


@app.get("/", tags=["Estado"], summary="Información de la API")
def root():
    return {
        "name": "Todo API",
        "version": app.version,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Estado"], summary="Health check")
def health():
    """
    Comprueba también la base de datos: responder OK con la conexión caída
    haría inútil el chequeo.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Health check: la base de datos no responde")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "degraded", "database": "unreachable"},
        )

    return {"status": "ok", "database": "ok", "environment": settings.environment}
