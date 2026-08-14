# NXT Loom

An AI operations platform for insurance — built for Southeast Asian Life, Health, Motor, Takaful, and broking workflows.

NXT Loom sits **on top of** existing core systems rather than replacing them. Documents arrive, get read and reasoned over by AI agents, and reach a human for verification wherever confidence is low — before anything is written downstream.

> **Design principle:** use AI for interpretation; use deterministic software for authority, state, security, audit, and irreversible actions.

## Status

UI prototype with static fixture data. There is no backend, no OCR, and no live model calls — the workflow engine, extraction, and integrations are represented, not implemented.

## Stack

| | |
|---|---|
| Framework | React 19 + Vite + TypeScript |
| Styling | Tailwind v4 + shadcn/ui (Radix) |
| Canvas | React Flow (`@xyflow/react`) |
| Motion | GSAP (staggered list reveals, reduced-motion aware) |
| Routing | React Router |
| Font | Manrope (self-hosted) |

## Getting started

```bash
npm install
npm run dev
```

```bash
npm run build
```

## Architecture

The product is organised as **Build → Run → Govern**, reflected directly in the navigation.

| Area | Route | What it does |
|---|---|---|
| Copilot | `/assistant` | Answers operational questions from run data, and policy questions from document sources with citations |
| Products | `/products` | No-code product builder — plans, benefits, underwriting rules, Shariah structures |
| Flows | `/flows` | Automation list and the Flow Studio node-graph editor |
| Placements | `/placements` | Broker workspace — market a slip, compare carrier quotes, surface deviations |
| Runs | `/runs` | Live execution monitoring with node-level trace and recovery |
| Items | `/items` | Human review queue with grounded evidence and confidence |
| Insights | `/insights` | STP, accuracy, drift, confidence calibration, reviewer throughput |
| Settings | `/settings` | Workspaces, markets & residency, agents, integrations, users, roles, keys, environments, variables |

## Southeast Asia specifics

The product is built for SEA rather than localised into it.

- **Currency** — `src/data/locale.ts` implements per-market formatting. IDR and VND drop minor units and use `.` as the thousands separator; VND suffixes its symbol. `Rp612.000.000`, not `Rp612,000,000.00`.
- **Data residency** — Indonesia (PP 71/2019, PDP Law 27/2022) and Vietnam (Decree 13/2023) require in-country storage. Surfaced per market in Settings.
- **Takaful** — Wakalah and Mudharabah structures with Tabarru' fund allocation, surplus distribution, and a Shariah board approval gate.
- **Names** — Indonesian and Malaysian names are frequently mononyms; Vietnamese is family-name-first. Extraction returns the printed form alongside a parsed structure rather than forcing first/last.
- **Channels** — WhatsApp and Zalo intake, e-wallet payouts, bancassurance branch flows.

## Workflows

| Flow | Markets |
|---|---|
| Health Claim Adjudication (panel & reimbursement) | SG · MY · TH · ID |
| Motor Claim Intake (photo & police report) | ID · VN · TH |
| Bancassurance Onboarding (branch STP) | SG · MY · PH |
| Broker Placement & Quote Comparison | SG · MY · ID · VN |
| Takaful Contribution & Surplus Allocation | MY · ID |
| Microinsurance Auto-Payout (e-wallet) | ID · PH · VN |
| Agency Recruitment & Licensing | ID · VN · PH |
| Claims Indexing | all |

## Project layout

```
src/
├─ components/
│  ├─ canvas/     flow node, inspector, node library
│  ├─ shell/      topbar, layout, nav, status badge
│  └─ ui/         shadcn components
├─ data/          fixtures — locale, products, flows, runs, placements, items
├─ lib/           utils, GSAP stagger hook
└─ pages/         one file per route
```

## Known gaps

- UI strings are English only; no i18n layer yet
- OCR accuracy for Thai script, Vietnamese diacritics, and handwriting is unmeasured
- Bundle is ~845 kB; React Flow and route pages should be dynamically imported
