"""
Punto de entrada principal de la aplicación FastAPI.
Registra los routers y configura la app.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.session import engine, Base
from app.routes import auth, tasks

# Crear todas las tablas en la base de datos al iniciar
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Todo API",
    description="API de gestión de tareas con autenticación JWT",
    version="1.0.0",
)

# Configuración de CORS (permite llamadas desde cualquier origen en desarrollo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tareas"])


@app.get("/", tags=["Health"])
def root():
    """Endpoint de verificación de estado de la API."""
    return {"message": "Todo API funcionando correctamente ✅", "docs": "/docs"}
