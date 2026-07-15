<!-- managed:linked-repos -->
## Linked Repositories
- wesonly/VirtuStaff
<!-- /managed:linked-repos -->

# VirtuStaff Code Workflow

## Repository
- **GitHub**: wesonly/VirtuStaff
- The repo contains the full VirtuStaff codebase:
  - `/site/` — The marketing website and customer dashboard (TanStack Start app)
  - `/backend/` — The Hono.js API server
  - `architecture.md` — Platform architecture document

## Branch Strategy
- `main` — Production-ready code
- Feature branches named descriptively (e.g. `dashboard-ui`, `stripe-integration`)

## Delivery Process
1. Members push code to feature branches and create pull requests
2. The lead reviews submitted work and merges PRs using `gh pr merge`
3. The lead can also push directly to `main` for initial setup

## Publishing
- Site is published by running `bun run publish` (or `TMPDIR=/tmp npm run build` if bun has tempdir issues)
- The site serves on port 3000