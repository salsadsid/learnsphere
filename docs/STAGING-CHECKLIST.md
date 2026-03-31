# Staging Checklist

## Pre-deploy
- [ ] Run API tests (`npm test` in apps/api).
- [ ] Run web tests (`npm test` in apps/web).
- [ ] Confirm environment variables in staging.
- [ ] Run `npm run build` in apps/web.

## Deploy
- [ ] Deploy API to staging environment.
- [ ] Deploy web app to staging environment.
- [ ] Validate health endpoints (`/health`, `/ready`).

## Post-deploy
- [ ] Smoke test key flows (auth, courses, enrollment).
- [ ] Verify dashboards render and metrics load.
- [ ] Capture latency snapshot from `/metrics/latency`.
