# 0002 — Configuration fails fast, with no default secret

**Status:** accepted · 2026-09

## Context

The original code read the JWT signing key like this:

```python
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-not-for-production")
```

The intent was convenience: the app runs locally without any setup. The effect
was that a missing or misspelled environment variable in production is
**silent**. The app boots, serves traffic, and signs every token with a key that
is published in a public repository. Anyone who reads the source can mint a
valid token for any account, and nothing in the logs would ever say so.

## Decision

Settings live in a `pydantic-settings` model. `SECRET_KEY` has no default and a
32-character minimum, so a missing value raises a `ValidationError` at import
time and the process never starts.

## Rationale

The failure modes are not symmetric. A crash at boot is discovered in seconds,
by the person deploying. A silently weak signing key may never be discovered at
all — and if it is, it is discovered by someone else.

Convenience is preserved where it is harmless: `.env.example` documents every
variable, `DATABASE_URL` defaults to local SQLite, and the CI workflow supplies
a throwaway key.

## Consequences

- A fresh clone cannot run the API until `.env` exists. The README makes this
  an explicit step and explains why.
- Every setting is now typed and validated in one place instead of being read
  with `os.getenv` scattered across modules.
- `CORS_ORIGINS` moved into configuration at the same time, replacing
  `allow_origins=["*"]`.
