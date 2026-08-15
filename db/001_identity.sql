-- ============================================================================
-- 001 — Identity, organisation, and market scope
--
-- Phase 1 of the platform plan: the tables that make the client-side auth real.
-- Nothing here stores personal data belonging to a policyholder, which is
-- deliberate — that is the material residency law constrains, and it does not
-- land until the schema is deployable per region.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tenant
--
-- tenant_kind is load-bearing, not descriptive. A broker inside a brokerage is
-- staff with full sight of the book; a broker seen from an insurer is an
-- external partner who must never see it. Same job title, opposite security
-- posture — so the boundary has to be a property of the tenant.
-- ---------------------------------------------------------------------------
create table if not exists org (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  tenant_kind  text not null check (tenant_kind in ('insurer', 'brokerage', 'mga')),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Markets
--
-- Seed markets are shared by every tenant and carry org_id null. A tenant may
-- add its own; those carry its org_id and are visible only to it.
--
-- residency drives where this market's personal data may be stored:
--   none      — no restriction
--   preferred — in-region preferred, not compelled
--   required  — must remain in-country (Indonesia, Vietnam)
-- ---------------------------------------------------------------------------
create table if not exists market (
  code         text not null,
  org_id       uuid references org(id) on delete cascade,
  name         text not null,
  flag         text not null,
  currency     text not null,
  regulator    text not null,
  regulator_name text not null default '',
  residency    text not null default 'preferred'
                 check (residency in ('none', 'preferred', 'required')),
  data_law     text not null default '',
  takaful      boolean not null default false,
  created_at   timestamptz not null default now(),
  -- A tenant's custom code may collide with another tenant's; a seed code is
  -- globally unique. Both are expressed by making org_id part of the key.
  primary key (code, org_id)
);

-- Seed rows have a null org_id, and null never equals null in a unique index,
-- so uniqueness among them needs stating separately.
create unique index if not exists market_seed_code_uq
  on market (code) where org_id is null;

-- ---------------------------------------------------------------------------
-- Branches — each reports into exactly one market and inherits its rules.
-- ---------------------------------------------------------------------------
create table if not exists branch (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references org(id) on delete cascade,
  market_code  text not null,
  name         text not null,
  manager      text not null default '',
  status       text not null default 'active' check (status in ('active', 'paused')),
  created_at   timestamptz not null default now()
);

create index if not exists branch_org_market_ix on branch (org_id, market_code);

-- ---------------------------------------------------------------------------
-- Users
--
-- base_role plus grants, rather than a fixed role bundle: fourteen hard-coded
-- roles becomes sixty the moment customers ask for variants.
--
-- read_only is enforced here as well as in the app because oversight roles
-- must not be able to edit the audit trail they are checking.
-- ---------------------------------------------------------------------------
create table if not exists app_user (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references org(id) on delete cascade,
  email          text not null,
  name           text not null,
  initials       text not null,
  title          text not null default '',
  base_role      text not null check (base_role in
                   ('producer','servicer','finance','builder','oversight','admin')),
  read_only      boolean not null default false,
  bind_authority numeric(18,2),
  branch_id      uuid references branch(id) on delete set null,
  -- External party working with this tenant rather than inside it. A boundary,
  -- not a permission level: rows are visible to them only where they are named.
  -- Whether a broker is internal or external depends on who the tenant is, so
  -- it is stated per user rather than inferred from base_role.
  external_firm   text,
  external_handle text,
  status         text not null default 'active' check (status in ('active','suspended')),
  created_at     timestamptz not null default now(),
  unique (org_id, email),
  -- Both halves or neither; a firm with no handle matches no records.
  constraint external_pair check (
    (external_firm is null and external_handle is null)
    or (external_firm is not null and external_handle is not null)
  )
);

-- Market scope. Absence of a row is absence of access — there is no wildcard.
-- Under Indonesia's PDP Law and Vietnam's Decree 13, a manager in one country
-- reading another country's claimant data can be a legal violation, so this is
-- checked server-side on every request rather than filtered in the UI.
create table if not exists user_market (
  user_id      uuid not null references app_user(id) on delete cascade,
  market_code  text not null,
  primary key (user_id, market_code)
);

create table if not exists user_capability (
  user_id      uuid not null references app_user(id) on delete cascade,
  capability   text not null check (capability in (
                 'item.review','item.override','placement.bind',
                 'flow.edit','flow.publish','product.edit',
                 'ledger.post','ledger.approve','run.manage',
                 'audit.read','admin.org')),
  primary key (user_id, capability)
);

-- ---------------------------------------------------------------------------
-- Sessions — opaque server-side tokens, so a sign-out is immediate rather than
-- waiting for a JWT to expire.
-- ---------------------------------------------------------------------------
create table if not exists session (
  token        text primary key,
  user_id      uuid not null references app_user(id) on delete cascade,
  issued_at    timestamptz not null default now(),
  expires_at   timestamptz not null,
  user_agent   text
);

create index if not exists session_user_ix on session (user_id);

-- ---------------------------------------------------------------------------
-- Audit
--
-- Append-only by intent: there is no update or delete path in the API. A
-- compliance officer who can rewrite this cannot be said to have audited
-- anything.
-- ---------------------------------------------------------------------------
create table if not exists audit_event (
  id           bigserial primary key,
  org_id       uuid not null references org(id) on delete cascade,
  actor_id     uuid references app_user(id) on delete set null,
  actor_name   text not null default '',
  action       text not null,
  subject      text not null default '',
  market_code  text,
  detail       jsonb not null default '{}'::jsonb,
  occurred_at  timestamptz not null default now()
);

create index if not exists audit_org_time_ix on audit_event (org_id, occurred_at desc);
