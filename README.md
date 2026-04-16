# MediaVault (React + TypeScript + Vite)

MediaVault is a Vite + React app for tracking movies, TV series, and anime with ratings and notes.

## Local setup

1. Install dependencies:

```bash
npm ci
```

2. Create your environment file from the example:

```bash
cp .env.example .env
```

3. Fill in required vars in `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

4. Run the app:

```bash
npm run dev
```

## Scripts

- `npm run dev` - start local dev server
- `npm run test:run` - run unit + integration tests (Vitest)
- `npm run build` - type-check + production build
- `npm run lint` - lint source files
- `npm run cy:open` - open Cypress
- `npm run cy:run` - run Cypress E2E

## CI/CD overview

This repo now uses two GitHub Actions deployment pipelines:

- **Dev pipeline**: `.github/workflows/deploy-dev.yml`
  - Trigger: push to `develop`
  - GitHub Environment: `dev`
  - Flow: `npm ci` -> `npm run test:run` -> `npm run build` -> deploy to Vercel preview

- **Production pipeline**: `.github/workflows/deploy-prod.yml`
  - Trigger: push to `main`
  - GitHub Environment: `production`
  - Flow: `npm ci` -> `npm run test:run` -> `npm run build` -> deploy to Vercel production

Both workflows have concurrency enabled to avoid overlapping deployments.

## Required GitHub Environments + secrets

Create two environments in GitHub:

- `dev`
- `production`

Add these secrets in **both** environments:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Vercel notes

- Deployments are done with Vercel CLI from GitHub Actions.
- Dev uses preview deploy (`vercel deploy ./dist`).
- Production uses prod deploy (`vercel deploy ./dist --prod`).

## Important

If tests are failing in your repo, deployment will stop before build/deploy (by design).
