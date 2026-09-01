# 0005 — No WebSockets, no roles, no microservices

**Status:** accepted · 2026-09

## Context

A task manager invites a long list of additions: real-time collaboration,
teams, role-based access control, an event bus, a service split. Each is
individually defensible, and each would make the stack look larger on paper.

## Decision

None of them are in this project. What was built instead: real persistence,
migrations, tests, CI, containers, and an interface where everything visible
actually works.

## Rationale

Every dependency has a carrying cost — it has to be configured, tested,
documented, upgraded, and understood by whoever reads the repository next. That
cost is only worth paying against a problem that exists.

Concretely:

- **Real-time collaboration (WebSockets)** synchronises state between people.
  Tasks here belong to exactly one user, so there is nobody to synchronise
  with. It would be machinery with no counterpart.
- **Roles and permissions (RBAC)** express that different users have different
  rights over a shared resource. There are no shared resources yet, so a role
  table would hold one row and no permission would ever be denied. The
  authorisation this app genuinely needs — per-user ownership — is implemented
  and tested (see [ADR 0001](0001-404-instead-of-403.md)).
- **Microservices and message queues** solve independent scaling and
  independent deployment. This is one CRUD service with one consumer; splitting
  it would add network hops, partial failures and distributed transactions to
  buy nothing.

The prerequisite is ordering, not rejection. If shared projects are added
later, collaboration and roles stop being decoration and become requirements —
and at that point they should be built.

## Consequences

- The stack list is shorter than it could be. That is the intended outcome.
- The features that do exist are covered by tests and behave as advertised.
- The README roadmap records these as deliberate omissions rather than
  oversights, along with the condition that would change the decision.
