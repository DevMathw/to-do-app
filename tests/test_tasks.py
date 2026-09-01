"""Tests del CRUD de tareas: creación, filtros, paginación y validación."""

import pytest

from tests.conftest import API


def crear_tarea(client, headers, **campos):
    payload = {"title": "Tarea de prueba", **campos}
    response = client.post(f"{API}/tasks", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_crear_tarea_persiste_prioridad_etiqueta_y_fecha(client, auth_headers):
    """
    El caso que antes fallaba: estos tres campos se mostraban en la interfaz
    pero no se guardaban. Se comprueba releyendo desde el servidor.
    """
    creada = crear_tarea(
        client,
        auth_headers,
        title="Llamar al dentista",
        priority="high",
        tag="personal",
        due_date="2026-12-01",
    )

    releida = client.get(f"{API}/tasks/{creada['id']}", headers=auth_headers).json()

    assert releida["priority"] == "high"
    assert releida["tag"] == "personal"
    assert releida["due_date"] == "2026-12-01"
    assert releida["completed"] is False


def test_valores_por_defecto_al_crear(client, auth_headers):
    tarea = crear_tarea(client, auth_headers)

    assert tarea["priority"] == "med"
    assert tarea["tag"] == "work"
    assert tarea["due_date"] is None


@pytest.mark.parametrize(
    "campo,valor",
    [("priority", "urgentisima"), ("tag", "inventada")],
)
def test_rechaza_valores_no_permitidos(client, auth_headers, campo, valor):
    response = client.post(
        f"{API}/tasks",
        json={"title": "Tarea", campo: valor},
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_rechaza_titulo_vacio(client, auth_headers):
    response = client.post(f"{API}/tasks", json={"title": ""}, headers=auth_headers)

    assert response.status_code == 422


def test_listar_devuelve_envoltorio_con_total(client, auth_headers):
    for i in range(3):
        crear_tarea(client, auth_headers, title=f"Tarea {i}")

    body = client.get(f"{API}/tasks", headers=auth_headers).json()

    assert body["total"] == 3
    assert len(body["items"]) == 3
    assert body["skip"] == 0
    assert body["limit"] == 50


def test_paginacion_respeta_skip_y_limit_y_mantiene_total(client, auth_headers):
    for i in range(5):
        crear_tarea(client, auth_headers, title=f"Tarea {i}")

    body = client.get(f"{API}/tasks?skip=2&limit=2", headers=auth_headers).json()

    assert body["total"] == 5, "total debe contar todas las tareas, no solo la página"
    assert len(body["items"]) == 2


def test_orden_estable_mas_reciente_primero(client, auth_headers):
    crear_tarea(client, auth_headers, title="Primera")
    crear_tarea(client, auth_headers, title="Segunda")
    crear_tarea(client, auth_headers, title="Tercera")

    titulos = [t["title"] for t in client.get(f"{API}/tasks", headers=auth_headers).json()["items"]]

    assert titulos == ["Tercera", "Segunda", "Primera"]


def test_filtrar_por_prioridad(client, auth_headers):
    crear_tarea(client, auth_headers, title="Urgente", priority="high")
    crear_tarea(client, auth_headers, title="Normal", priority="med")

    body = client.get(f"{API}/tasks?priority=high", headers=auth_headers).json()

    assert body["total"] == 1
    assert body["items"][0]["title"] == "Urgente"


def test_filtrar_por_etiqueta(client, auth_headers):
    crear_tarea(client, auth_headers, title="Del trabajo", tag="work")
    crear_tarea(client, auth_headers, title="Personal", tag="personal")

    body = client.get(f"{API}/tasks?tag=personal", headers=auth_headers).json()

    assert body["total"] == 1
    assert body["items"][0]["title"] == "Personal"


def test_filtrar_por_estado(client, auth_headers):
    hecha = crear_tarea(client, auth_headers, title="Hecha")
    crear_tarea(client, auth_headers, title="Pendiente")
    client.patch(f"{API}/tasks/{hecha['id']}", json={"completed": True}, headers=auth_headers)

    completadas = client.get(f"{API}/tasks?completed=true", headers=auth_headers).json()
    pendientes = client.get(f"{API}/tasks?completed=false", headers=auth_headers).json()

    assert completadas["total"] == 1
    assert pendientes["total"] == 1


def test_busqueda_en_titulo_y_descripcion(client, auth_headers):
    crear_tarea(client, auth_headers, title="Comprar leche")
    crear_tarea(client, auth_headers, title="Otra cosa", description="también leche")
    crear_tarea(client, auth_headers, title="Nada que ver")

    body = client.get(f"{API}/tasks?search=leche", headers=auth_headers).json()

    assert body["total"] == 2


def test_patch_actualiza_solo_los_campos_enviados(client, auth_headers):
    tarea = crear_tarea(client, auth_headers, title="Original", description="Descripción original")

    actualizada = client.patch(
        f"{API}/tasks/{tarea['id']}",
        json={"completed": True},
        headers=auth_headers,
    ).json()

    assert actualizada["completed"] is True
    assert actualizada["title"] == "Original"
    assert actualizada["description"] == "Descripción original"


def test_patch_sin_campos_devuelve_400(client, auth_headers):
    tarea = crear_tarea(client, auth_headers)

    response = client.patch(f"{API}/tasks/{tarea['id']}", json={}, headers=auth_headers)

    assert response.status_code == 400


def test_borrar_devuelve_204_y_la_tarea_desaparece(client, auth_headers):
    tarea = crear_tarea(client, auth_headers)

    borrado = client.delete(f"{API}/tasks/{tarea['id']}", headers=auth_headers)

    assert borrado.status_code == 204
    assert client.get(f"{API}/tasks/{tarea['id']}", headers=auth_headers).status_code == 404


def test_tarea_inexistente_devuelve_404(client, auth_headers):
    assert client.get(f"{API}/tasks/9999", headers=auth_headers).status_code == 404
