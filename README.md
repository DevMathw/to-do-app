# 📝 Todo API — FastAPI + SQLite + JWT

API REST de gestión de tareas construida con **FastAPI**, **SQLAlchemy** y autenticación **JWT**. Lista para usar en portafolio o como base para proyectos reales.

## ✨ Características

- ✅ CRUD completo de tareas
- 🔐 Autenticación con JWT (registro y login)
- 👤 Aislamiento de datos por usuario
- 🗄️ Base de datos SQLite con SQLAlchemy ORM
- 📋 Validación con Pydantic v2
- 🔒 Hash de contraseñas con bcrypt
- 📖 Documentación automática en `/docs`

## 📁 Estructura del Proyecto

```
todo-api/
├── app/
│   ├── main.py              # Punto de entrada, configuración de la app
│   ├── database/
│   │   └── session.py       # Engine, sesión y Base SQLAlchemy
│   ├── models/
│   │   ├── user.py          # Modelo ORM Usuario
│   │   └── task.py          # Modelo ORM Tarea
│   ├── schemas/
│   │   ├── user.py          # Schemas Pydantic para usuarios y tokens
│   │   └── task.py          # Schemas Pydantic para tareas
│   ├── routes/
│   │   ├── auth.py          # Rutas: /register, /login
│   │   └── tasks.py         # Rutas: CRUD de tareas
│   └── core/
│       └── security.py      # JWT, bcrypt, dependency get_current_user
├── requirements.txt
└── README.md
```

## 🚀 Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/todo-api.git
cd todo-api
```

### 2. Crear entorno virtual e instalar dependencias

```bash
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
```

### 3. Ejecutar el servidor

```bash
uvicorn app.main:app --reload
```

La API estará disponible en: `http://127.0.0.1:8000`
Documentación interactiva: `http://127.0.0.1:8000/docs`

---

## 📡 Ejemplos de endpoints

### Registrar usuario

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe", "email": "john@example.com", "password": "secret123"}'
```

### Login (obtener token JWT)

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=johndoe&password=secret123"
```

Respuesta:
```json
{ "access_token": "eyJ...", "token_type": "bearer" }
```

### Crear tarea

```bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Comprar leche", "description": "Ir al super antes de las 6pm"}'
```

### Obtener todas las tareas

```bash
curl http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer <TOKEN>"
```

### Obtener tarea por ID

```bash
curl http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer <TOKEN>"
```

### Actualizar tarea

```bash
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Eliminar tarea

```bash
curl -X DELETE http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🌐 Despliegue

### Railway (recomendado para portafolio)

1. Crea cuenta en [railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Railway detecta FastAPI automáticamente
4. Agrega la variable de entorno `PORT=8000`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Render

1. Crea cuenta en [render.com](https://render.com)
2. Nuevo Web Service → conecta tu repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### ⚠️ Antes de desplegar en producción

- Mueve `SECRET_KEY` a una variable de entorno (`os.getenv("SECRET_KEY")`)
- Considera migrar de SQLite a PostgreSQL para producción
- Configura CORS para aceptar solo tu dominio frontend

## 🔧 Tech Stack

| Tecnología | Uso |
|------------|-----|
| FastAPI | Framework web |
| SQLAlchemy | ORM para base de datos |
| SQLite | Base de datos (desarrollo) |
| Pydantic v2 | Validación de datos |
| python-jose | Generación y validación JWT |
| passlib + bcrypt | Hash seguro de contraseñas |
| uvicorn | Servidor ASGI |

## 📄 Licencia

MIT
