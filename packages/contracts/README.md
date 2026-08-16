# @technxt/contracts

The vocabulary every TechNXT product shares. Types and rules only — no React,
no UI, no business logic.

## Why this exists

The products build and deploy separately, each with its own login. That works
only if they agree on what a market, a currency, a role and an event *are*.
Copying these definitions is the default, and six months later two products
disagree about what a policy is and neither is wrong.

## What belongs here

- **Markets** — the six seeded markets with their regulator, residency rule and
  data-protection law. Residency decides where a product may legally be
  deployed, so every product needs the same answer.
- **Money** — currency rules per market. IDR and VND take no minor units and a
  `.` thousands separator; a naive `toLocaleString` is wrong and still looks
  like money.
- **Access** — base roles, capabilities, market scope, the external-party
  boundary, and separation of duties.
- **Events** — the seven facts products exchange, each with exactly one
  publisher, plus the ledger posting request.

## What does not belong here

Screens, routes, stores, fixtures, or anything a single product decides for
itself. A contract that reaches into behaviour becomes a framework, and then
nobody can upgrade it.

## Versioning

Breaking a type here breaks every product. Additive changes are a minor bump;
anything that removes or narrows a field is major and needs a deprecation
window long enough for seven separate release cycles.
