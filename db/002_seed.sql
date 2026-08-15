-- ============================================================================
-- 002 — Seed
--
-- The six Southeast Asian markets and the demo roster, mirroring what the app
-- currently holds in fixtures. Re-runnable: every insert is idempotent.
-- ============================================================================

insert into org (id, name, tenant_kind) values
  ('00000000-0000-0000-0000-0000000000a1', 'NXT Loom Demo Org', 'brokerage')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Markets. Residency is the field that decides where personal data may live:
-- Indonesia and Vietnam compel in-country storage by statute.
-- ---------------------------------------------------------------------------
insert into market (code, org_id, name, flag, currency, regulator, regulator_name, residency, data_law, takaful) values
  ('SG', null, 'Singapore',   '🇸🇬', 'SGD', 'MAS',     'Monetary Authority of Singapore',   'none',      'PDPA 2012',                    false),
  ('MY', null, 'Malaysia',    '🇲🇾', 'MYR', 'BNM',     'Bank Negara Malaysia',              'preferred', 'PDPA 2010',                    true),
  ('ID', null, 'Indonesia',   '🇮🇩', 'IDR', 'OJK',     'Otoritas Jasa Keuangan',            'required',  'PDP Law 27/2022 · PP 71/2019', true),
  ('TH', null, 'Thailand',    '🇹🇭', 'THB', 'OIC',     'Office of Insurance Commission',    'preferred', 'PDPA 2019',                    false),
  ('VN', null, 'Vietnam',     '🇻🇳', 'VND', 'MOF-ISA', 'Insurance Supervisory Authority',   'required',  'Decree 13/2023',               false),
  ('PH', null, 'Philippines', '🇵🇭', 'PHP', 'IC',      'Insurance Commission',              'preferred', 'Data Privacy Act 2012',        false)
on conflict (code, org_id) do nothing;

-- ---------------------------------------------------------------------------
-- Branches
-- ---------------------------------------------------------------------------
insert into branch (id, org_id, market_code, name, manager) values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', 'SG', 'Singapore HQ',      'Sarah Chen'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a1', 'MY', 'Kuala Lumpur',      'Aisyah Rahman'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000a1', 'MY', 'Penang',            'Lim Wei Jie'),
  ('00000000-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-0000000000a1', 'ID', 'Jakarta',           'Rizky Pratama'),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-0000000000a1', 'ID', 'Surabaya',          'Dewi Anggraini'),
  ('00000000-0000-0000-0000-0000000000b6', '00000000-0000-0000-0000-0000000000a1', 'TH', 'Bangkok',           'Somchai Wattana'),
  ('00000000-0000-0000-0000-0000000000b7', '00000000-0000-0000-0000-0000000000a1', 'VN', 'Ho Chi Minh City',  'Nguyen Van Minh'),
  ('00000000-0000-0000-0000-0000000000b8', '00000000-0000-0000-0000-0000000000a1', 'PH', 'Manila',            'Maria Santos')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Demo roster — one user per role the merged platform produces.
-- ---------------------------------------------------------------------------
insert into app_user (id, org_id, email, name, initials, title, base_role, read_only, bind_authority, branch_id) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1', 'aisyah.rahman@demo.nxtloom.com',  'Aisyah Rahman',   'AR', 'Claims Processor',    'servicer',  false, null,        '00000000-0000-0000-0000-0000000000b2'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000a1', 'minh.nguyen@demo.nxtloom.com',    'Nguyen Van Minh', 'NM', 'Underwriter',         'servicer',  false, 500000000,   '00000000-0000-0000-0000-0000000000b7'),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000a1', 'sarah.chen@demo.nxtloom.com',     'Sarah Chen',      'SC', 'Operations Manager',  'servicer',  false, null,        '00000000-0000-0000-0000-0000000000b1'),
  ('00000000-0000-0000-0000-0000000000c4', '00000000-0000-0000-0000-0000000000a1', 'rizky.pratama@demo.nxtloom.com',  'Rizky Pratama',   'RP', 'Automation Engineer', 'builder',   false, null,        '00000000-0000-0000-0000-0000000000b4'),
  ('00000000-0000-0000-0000-0000000000c5', '00000000-0000-0000-0000-0000000000a1', 'somchai.w@demo.nxtloom.com',      'Somchai Wattana', 'SW', 'Compliance Officer',  'oversight', true,  null,        '00000000-0000-0000-0000-0000000000b6'),
  ('00000000-0000-0000-0000-0000000000c6', '00000000-0000-0000-0000-0000000000a1', 'priya.kumar@demo.nxtloom.com',    'Priya Kumar',     'PK', 'Org Administrator',   'admin',     false, null,        '00000000-0000-0000-0000-0000000000b1')
on conflict (id) do nothing;

-- Market scope, per user.
insert into user_market (user_id, market_code) values
  ('00000000-0000-0000-0000-0000000000c1', 'MY'),
  ('00000000-0000-0000-0000-0000000000c2', 'VN'),
  ('00000000-0000-0000-0000-0000000000c3', 'SG'),
  ('00000000-0000-0000-0000-0000000000c3', 'MY'),
  ('00000000-0000-0000-0000-0000000000c4', 'ID'),
  ('00000000-0000-0000-0000-0000000000c4', 'MY'),
  ('00000000-0000-0000-0000-0000000000c4', 'SG'),
  ('00000000-0000-0000-0000-0000000000c5', 'SG'),
  ('00000000-0000-0000-0000-0000000000c5', 'MY'),
  ('00000000-0000-0000-0000-0000000000c5', 'ID'),
  ('00000000-0000-0000-0000-0000000000c5', 'TH'),
  ('00000000-0000-0000-0000-0000000000c5', 'VN'),
  ('00000000-0000-0000-0000-0000000000c5', 'PH'),
  ('00000000-0000-0000-0000-0000000000c6', 'SG'),
  ('00000000-0000-0000-0000-0000000000c6', 'MY'),
  ('00000000-0000-0000-0000-0000000000c6', 'ID'),
  ('00000000-0000-0000-0000-0000000000c6', 'TH'),
  ('00000000-0000-0000-0000-0000000000c6', 'VN'),
  ('00000000-0000-0000-0000-0000000000c6', 'PH')
on conflict do nothing;

-- Capability grants. Note the compliance officer holds only audit.read: an
-- oversight role that can change things has not audited anything.
insert into user_capability (user_id, capability) values
  ('00000000-0000-0000-0000-0000000000c1', 'item.review'),
  ('00000000-0000-0000-0000-0000000000c2', 'item.review'),
  ('00000000-0000-0000-0000-0000000000c2', 'item.override'),
  ('00000000-0000-0000-0000-0000000000c2', 'placement.bind'),
  ('00000000-0000-0000-0000-0000000000c3', 'item.review'),
  ('00000000-0000-0000-0000-0000000000c3', 'run.manage'),
  ('00000000-0000-0000-0000-0000000000c4', 'flow.edit'),
  ('00000000-0000-0000-0000-0000000000c4', 'run.manage'),
  ('00000000-0000-0000-0000-0000000000c5', 'audit.read'),
  ('00000000-0000-0000-0000-0000000000c6', 'admin.org'),
  ('00000000-0000-0000-0000-0000000000c6', 'product.edit'),
  ('00000000-0000-0000-0000-0000000000c6', 'flow.edit')
on conflict do nothing;
