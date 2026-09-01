"""
Aislamiento entre usuarios.

Es el grupo de tests más importante del proyecto: comprueba que un usuario
autenticado no puede leer ni modificar los datos de otro. El control de
acceso roto es la vulnerabilidad más común en aplicaciones de este tipo.
"""

import pytest

from tests.conftest import API


@pytest.fixture
def tarea_de_bob(client, other_auth_headers):
    response = client.post(
        f"{API}/tasks",
        json={"title": "Tarea privada de Bob", "priority": "high"},
        headers=other_auth_headers,
    )
    assert response.status_code == 201
    return response.json()


def test_alice_no_ve_las_tareas_de_bob_en_el_listado(client, auth_headers, tarea_de_bob):
    body = client.get(f"{API}/tasks", headers=auth_headers).json()

    assert body["total"] == 0
    assert body["items"] == []


def test_alice_no_puede_leer_una_tarea_de_bob(client, auth_headers, tarea_de_bob):
    response = client.get(f"{API}/tasks/{tarea_de_bob['id']}", headers=auth_headers)

    # 404 y no 403: un 403 confirmaría que ese id existe.
    assert response.status_code == 404


def test_alice_no_puede_modificar_una_tarea_de_bob(
    client, auth_headers, other_auth_headers, tarea_de_bob
):
    response = client.patch(
        f"{API}/tasks/{tarea_de_bob['id']}",
        json={"title": "Secuestrada"},
        headers=auth_headers,
    )

    assert response.status_code == 404

    # Y la tarea sigue intacta para su dueño.
    sin_cambios = client.get(f"{API}/tasks/{tarea_de_bob['id']}", headers=other_auth_headers).json()
    assert sin_cambios["title"] == "Tarea privada de Bob"


def test_alice_no_puede_borrar_una_tarea_de_bob(
    client, auth_headers, other_auth_headers, tarea_de_bob
):
    response = client.delete(f"{API}/tasks/{tarea_de_bob['id']}", headers=auth_headers)

    assert response.status_code == 404
    assert (
        client.get(f"{API}/tasks/{tarea_de_bob['id']}", headers=other_auth_headers).status_code
        == 200
    )


def test_la_tarea_creada_pertenece_a_quien_la_crea(client, auth_headers):
    """El owner_id lo pone el servidor: no se puede falsear desde el cliente."""
    creada = client.post(
        f"{API}/tasks",
        json={"title": "Mía", "owner_id": 9999},
        headers=auth_headers,
    ).json()

    yo = client.get(f"{API}/auth/me", headers=auth_headers).json()
    assert creada["owner_id"] == yo["id"]
    assert creada["owner_id"] != 9999


@pytest.mark.parametrize(
    "metodo,ruta",
    [
        ("get", "/tasks"),
        ("post", "/tasks"),
        ("get", "/tasks/1"),
        ("patch", "/tasks/1"),
        ("delete", "/tasks/1"),
    ],
)
def test_todas_las_rutas_de_tareas_exigen_autenticacion(client, metodo, ruta):
    # request() acepta el cuerpo de forma uniforme para todos los métodos.
    response = client.request(metodo.upper(), f"{API}{ruta}", json={"title": "x"})

    assert response.status_code == 401
