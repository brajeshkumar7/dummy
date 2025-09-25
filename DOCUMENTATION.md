# TALENT FLOW – Project Documentation

This document provides an in-depth guide to the TALENT FLOW application: goals, architecture, data model, routing, component library, development workflows, deployment, and troubleshooting. It complements the high-level README.

## 1. Purpose and Scope

TALENT FLOW is a modern recruiting platform demonstrating a complete hiring pipeline: job management, candidate tracking, assessments, analytics, and exports. It is built as a SPA using React + Vite and runs entirely in the browser with a simulated API (MSW + IndexedDB) for an end-to-end experience without a server.

## 2. High-Level Architecture

- UI: React 18, Tailwind CSS, shadcn/ui (Radix primitives)
- State/Server Sync: TanStack Query for caching, retries, background refresh
- Routing: React Router v6 with nested routes
- Mock Backend: MSW (Mock Service Worker) + Dexie (IndexedDB)
- Build: Vite

Directory overview:
- `src/pages/`: Top-level route components (landing, dashboard, jobs, candidates, assessments)
- `src/components/`: Reusable UI and app components (dialogs, tables, toggles)
- `src/components/ui/`: shadcn/ui wrappers used across the app
- `src/hooks/`: Data hooks (queries/mutations) and helpers
- `src/lib/`: Utilities and the mock database initialization
- `src/mocks/`: MSW handlers and browser setup for API simulation

## 3. Routing Map

Public
- `/`: Landing page

App (protected in real apps, public in this demo)
- `/app`: Dashboard (analytics, funnel, KPIs)
- `/app/jobs`: Jobs listing + filters
- `/app/jobs/:idOrSlug`: Job details
- `/app/candidates`: Candidates table and Kanban
- `/app/candidates/:idOrSlug`: Candidate detail
- `/app/assessments`: Assessment list and builder

Client-side routing requires an SPA fallback (serve `index.html` for unknown routes).

## 4. Data Model (IndexedDB via Dexie)

- `jobs`: { id, title, department, status, location, type, experience_level, description, created_at, updated_at, slug }
- `candidates`: { id, name, email, phone, position, stage, location, experience, created_at }
- `applications`: { id, job_id, candidate_id, status, created_at }
- `assessments`: { id, job_id?, name, questions[], created_at }

Relationships
- A job has many applications
- A candidate can have many applications

## 5. API Simulation (MSW)

Location: `src/mocks/handlers.js`
- Implements REST endpoints for jobs, candidates, applications, and analytics
- Pagination, filtering, and sorting are handled server-like
- Network conditions: artificial latency 200–1200ms and ~7.5% error rate (within the 5–10% requirement)
- The error and delay helpers are centralized and applied in handlers before returning data

Startup
- `src/mocks/browser.js` enables MSW in development and preview builds

## 6. State and Data Fetching

TanStack Query powers all I/O via custom hooks in `src/hooks/`:
- Query Keys: namespaced per entity (`['jobs']`, `['candidates','stats']`)
- Caching: sensible `staleTime` and `gcTime` defaults, with background refetch on window focus
- Mutations: optimistic updates where appropriate with rollback on failure

## 7. UI System

- Tailwind CSS for design tokens and utility classes
- shadcn/ui wrappers under `src/components/ui/` for consistent, accessible primitives (Button, Dialog, Dropdown, Table, etc.)
- Theming: light/dark via a small Zustand store in `src/stores/theme.js`; persisted and toggled with `ThemeToggle`

## 8. Analytics and Funnel

- Dashboard normalizes multiple stage names (applied, screening, test, offer, hired, rejected)
- Funnel bars are scaled against the total candidate count (not max) so segment counts sum to the total (e.g., 1000)

## 9. Demo Previews

- Landing page buttons open a scrollable dialog (`src/components/demo-dialog.jsx`)
- The dialog renders scaled, non-interactive iframes for: Home, Dashboard, Jobs, Candidates, Assessments
- The dialog header is fixed to "Demo" for a consistent experience

## 10. Exporting Data

- `src/components/export-dialog.jsx` supports bulk export of Jobs, Candidates, and Analytics
- Multiple formats: CSV/Excel/JSON/PDF (PDF via client-side library)

## 11. Error Handling and UX

- Global loading states and skeletons for slow queries
- Retry with backoff (TanStack Query defaults)
- Toasts and inline messages for success/failure
- Guards for empty/error states in tables and charts

## 12. Performance

- Vite production optimizations and tree-shaking
- Route/component lazy loading where beneficial
- Known bundle size warnings are acceptable for the demo; can be reduced via manual chunking

## 13. Accessibility

- Keyboard-navigable components via Radix primitives
- Theme contrast checked for dark/light backgrounds
- Labels and roles on interactive controls where applicable

## 14. Security Considerations (Demo)

- Client-side mock API—no real authentication or server secrets
- Input validation on forms; sanitize displayed user content
- For production, integrate real auth and server-side validation

## 15. Setup & Development

Prerequisites
- Node 18+

Install & Run
```bash
npm install
npm run dev
```

Build & Preview
```bash
npm run build
npm run preview
```

Lint
```bash
npm run lint
```

## 16. Deployment

This is a static SPA. Build output is in `dist/`.
- Vercel: Framework = Vite; Build = `npm run build`; Output = `dist`
- Netlify: Build = `npm run build`; Publish = `dist`; add redirects: `/* /index.html 200`
- Any static host (S3/CloudFront, Nginx): serve `dist` and configure SPA fallback

## 17. Troubleshooting

- Blank page on deep link after deploy: missing SPA fallback; add rewrite to `index.html`
- API errors in dev: ensure MSW is running; reload after first boot so the service worker activates
- Large bundles: enable code-splitting or `manualChunks` in Vite Rollup options

## 18. Future Work

- Real backend integration (NestJS/Express/FastAPI) with auth (JWT/OAuth)
- Role-based access control; multi-tenant orgs and teams
- Webhooks and 3rd-party ATS integrations
- Advanced analytics with cohorting and conversion funnels

## 19. Changelog (Template)

```
## [Unreleased]
-

## [1.0.0] - YYYY-MM-DD
- Initial public release
```

---

For quick links and a high-level summary, see the top-level `README.md`.

## 20. Project Map (from source tree)

Top-level (important files):
- `index.html` – Vite SPA entry
- `vite.config.js` – Vite + path alias (`@ -> src`)
- `tailwind.config.js`, `postcss.config.js` – styling pipeline
- `package.json` – scripts and dependencies
- `public/` – static assets and MSW worker (prod preview)
- `dist/` – production build output (generated)

`src/` key folders:
- `src/main.jsx` – app bootstrap (router + providers)
- `src/pages/` – route pages: `landing.jsx`, `dashboard.jsx`, `jobs.jsx`, `jobs/*`, `candidates.jsx`, `candidate-detail.jsx`, `assessments.jsx`, `assessment-builder.jsx`, `assessment-run.jsx`, `app-layout.jsx`
- `src/components/` – composite components: `export-dialog.jsx`, `saved-searches.jsx`, `theme-toggle.jsx`, `settings-menu.jsx`, `demo-dialog.jsx`
- `src/components/ui/` – shadcn/ui wrappers (button, card, table, dialog, dropdown, select, input, etc.)
- `src/hooks/` – data hooks: `useJobs.js`, `useCandidates.js`, `useApplications.js`
- `src/lib/` – `db/` (Dexie schema), `export.js` helpers, `utils.js`
- `src/mocks/` – `browser.js` (start MSW), `handlers.js` (all API routes & network simulation)
- `src/stores/` – `theme.js` Zustand store

## 21. Endpoints (MSW) – Summary

Jobs
- `GET /api/jobs` – list (page, limit, search, department, status, sort)
- `GET /api/jobs/stats` – aggregate metrics
- `GET /api/jobs/:idOrSlug`
- `POST /api/jobs`
- `PUT /api/jobs/:idOrSlug`
- `PATCH /api/jobs/:idOrSlug`
- `DELETE /api/jobs/:id`

Candidates
- `GET /api/candidates` – list + filters
- `GET /api/candidates/stats` – total + stage breakdown (applied, screening, test, offer, hired, rejected)
- `GET /api/candidates/positions`, `GET /api/candidates/locations`
- `GET /api/candidates/by-stage`
- `POST /api/candidates`
- `PUT /api/candidates/:id`
- `DELETE /api/candidates/:id`

Applications
- `GET /api/applications`
- `POST /api/applications`
- `GET /api/applications/:id`
- `PUT /api/applications/:id`

Assessments (stats + list in pages)
- `GET /api/assessments/stats` and other endpoints used by assessment pages

Network simulation
- Latency: random 200–1200ms
- Error rate: ~7.5% across endpoints (within 5–10%)

## 22. Hooks – Responsibilities

`src/hooks/useJobs.js`
- Queries: list jobs, get job by id/slug, stats
- Mutations: create, update, archive/delete

`src/hooks/useCandidates.js`
- Queries: list candidates, stats, positions, locations, by-stage, infinite scrolling
- Mutations: create/update/delete; bulk update

`src/hooks/useApplications.js`
- Queries: list, by candidate/job
- Mutations: create/update

Each hook wraps TanStack Query with typed keys, parameters, and returns `{ data, isLoading, error, mutate }`-style APIs.

## 23. Notable Components

- `AppLayout` – Sidebar + topbar, theme toggle, Settings dropdown
- `SettingsMenu` – global quick navigation (Home, Dashboard, Jobs, Candidates, Assessments)
- `DemoDialog` – scrollable modal with scaled, non-interactive previews of routes (via iframes)
- `ExportDialog` – multi-dataset export (jobs, candidates, analytics)
- UI primitives under `components/ui/*` – consistent styling

## 24. Theming & UX Details

- Theme persisted via Zustand; `ThemeToggle` switches light/dark
- Gradients and glassmorphism via Tailwind utilities; consistent rounded radii
- Data tables support sorting and responsive overflow

## 25. Testing & Quality

- ESLint configured; run `npm run lint`
- Manual exploratory testing across critical flows (job CRUD, candidate CRUD, drag-and-drop pipeline)
- MSW ensures deterministic test data with realistic timings and intermittent failures

## 26. Build & Release

Commands
- `npm run build` – creates optimized assets in `dist/`
- `npm run preview` – serves built app locally

Artifacts
- HTML: `dist/index.html`
- Assets: `dist/assets/*`

Release steps
- Bump version, push to Git, deploy via preferred host (Vercel/Netlify/etc.)

Post-deploy check
- Verify SPA fallback works for deep URLs like `/app/candidates`
- Validate MSW is disabled on production host unless intentionally included for demo

## 27. FAQ

Q: Why IndexedDB instead of a server?
A: To keep the app self-contained for local running and demos while preserving realistic async behavior and persistence.

Q: How do I replace MSW with a real backend?
A: Replace calls to `/api/*` with your server endpoints; remove MSW boot in `src/mocks/browser.js`; keep the same response shapes to avoid UI refactors.

Q: Why do I sometimes see simulated errors?
A: The network simulation injects a ~7.5% error rate to validate resiliency. Retry or handle errors as the UI does.

Q: Why are there bundle size warnings?
A: The app ships with rich visuals; warnings are non-blocking. Apply manualChunks or add route-level code splitting if needed.
