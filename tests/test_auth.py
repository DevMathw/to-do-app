"""Tests de registro, login y perfil."""

from tests.conftest import API


def test_register_devuelve_201_y_no_expone_el_hash(client):
    response = client.post(
        f"{API}/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "password-de-test",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "alice"
    assert body["is_active"] is True
    assert "hashed_password" not in body
    assert "password" not in body


def test_register_rechaza_username_duplicado(client):
    payload = {
        "username": "alice",
        "email": "alice@example.com",
        "password": "password-de-test",
    }
    client.post(f"{API}/auth/register", json=payload)

    response = client.post(f"{API}/auth/register", json={**payload, "email": "otra@example.com"})

    assert response.status_code == 409
    assert "nombre de usuario" in response.json()["detail"]


def test_register_rechaza_email_duplicado(client):
    payload = {
        "username": "alice",
        "email": "alice@example.com",
        "password": "password-de-test",
    }
    client.post(f"{API}/auth/register", json=payload)

    response = client.post(f"{API}/auth/register", json={**payload, "username": "otra"})

    assert response.status_code == 409
    assert "email" in response.json()["detail"]


def test_register_rechaza_password_corta(client):
    response = client.post(
        f"{API}/auth/register",
        json={"username": "alice", "email": "alice@example.com", "password": "corta"},
    )

    assert response.status_code == 422


def test_register_rechaza_email_invalido(client):
    response = client.post(
        f"{API}/auth/register",
        json={
            "username": "alice",
            "email": "no-es-un-email",
            "password": "password-de-test",
        },
    )

    assert response.status_code == 422
    # El manejador normaliza el error a un string, no a una lista de objetos.
    assert isinstance(response.json()["detail"], str)


def test_login_devuelve_token_y_expiracion(client):
    client.post(
        f"{API}/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "password-de-test",
        },
    )

    response = client.post(
        f"{API}/auth/login",
        data={"username": "alice", "password": "password-de-test"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["expires_in"] > 0


def test_login_no_revela_si_el_usuario_existe(client):
    """El mensaje debe ser idéntico para usuario inexistente y password mala."""
    client.post(
        f"{API}/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "password-de-test",
        },
    )

    password_incorrecta = client.post(
        f"{API}/auth/login", data={"username": "alice", "password": "otra-cosa"}
    )
    usuario_inexistente = client.post(
        f"{API}/auth/login", data={"username": "nadie", "password": "otra-cosa"}
    )

    assert password_incorrecta.status_code == 401
    assert usuario_inexistente.status_code == 401
    assert password_incorrecta.json() == usuario_inexistente.json()


def test_me_devuelve_el_usuario_autenticado(client, auth_headers):
    response = client.get(f"{API}/auth/me", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["username"] == "alice"


def test_me_sin_token_devuelve_401(client):
    assert client.get(f"{API}/auth/me").status_code == 401


def test_me_con_token_invalido_devuelve_401(client):
    response = client.get(f"{API}/auth/me", headers={"Authorization": "Bearer token-falsificado"})

    assert response.status_code == 401
