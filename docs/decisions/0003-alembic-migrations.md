# 0003 — Alembic from the start, not `create_all`

**Status:** accepted · 2026-09

## Context

The app used to create its schema on startup:

```python
Base.metadata.create_all(bind=engine)
```

This works exactly once. `create_all` creates tables that do not exist; it never
alters tables that do. Adding `priority`, `tag` and `due_date` to `Task` would
have produced an app that starts cleanly and then fails on every query, because
the ORM selects columns the table does not have.

The only recovery is dropping the database — which was survivable only because
the deployment was already losing its data on every restart.

## Decision

Adopt Alembic. `alembic/env.py` takes its URL from the application settings
rather than from `alembic.ini`, so migrations and the server can never point at
different databases. The Docker entrypoint runs `alembic upgrade head` before
starting Uvicorn.

## Rationale

Schema is state, and state needs versioning as much as code does. Without
migrations there is no way to move a production database forward, no way to
review a schema change in a pull request, and no way to roll one back.

CI runs `alembic check`, which fails the build if a model was changed without a
matching migration. Without that check the two drift apart quietly and the
problem surfaces at deploy time instead.

`render_as_batch` is enabled for SQLite, which cannot `ALTER TABLE` in the
general case; Alembic recreates and copies the table transparently.

## Consequences

- One extra step for contributors: `alembic upgrade head` after cloning.
- Schema changes now require generating and reviewing a migration file.
- SQLite remains the development default, but it is not viable for the deployed
  instance: Render's free tier does not persist the filesystem, so the database
  is wiped on every restart. `DATABASE_URL` is now configurable precisely so
  production can point at PostgreSQL.
