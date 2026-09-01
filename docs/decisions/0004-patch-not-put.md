# 0004 — PATCH instead of PUT for partial updates

**Status:** accepted · 2026-09

## Context

The update route was declared as `PUT` but implemented as a partial update:

```python
@router.put("/{task_id}")
def update_task(...):
    update_data = task_data.model_dump(exclude_unset=True)
```

Its own docstring described the behaviour as "PATCH-style". The method in the
URL and the semantics in the body disagreed.

## Decision

Expose the operation as `PATCH`. `PUT` is not offered at all.

## Rationale

`PUT` means "replace the resource with this representation": fields absent from
the body should be cleared. Anything that treats an absent field as "leave it
alone" is `PATCH`. Clients — including caches, proxies and other developers —
are entitled to rely on that difference.

`PUT` is not offered because a full-replacement endpoint has no use here. Every
mutation in the UI is partial (toggle completion, edit a title, change a
priority), and adding an endpoint that nothing calls means adding an endpoint
nothing tests.

## Consequences

- The frontend client sends `PATCH`. There is no backwards-compatible `PUT`
  alias, which is acceptable because this API has exactly one consumer.
- A `PATCH` with an empty body returns `400` rather than silently succeeding: a
  request that asks for no change is more likely a client bug than an intention.
