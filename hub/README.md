# Highland / Rua Hub adapter

The existing React public website and Express compatibility API remain independently deployed. The Hub editor uses the exported original React page renderer and source CSS; ordinary content management moves to Hub's Authentik-protected Studio.

build-adapter.mjs exports the actual frontend renderer and CSS into this package. manifest.json contains six page documents and one authoritative shared site-settings document, seeded from a verified public API snapshot. Change source components/CSS here, regenerate the adapter and bump package/registry versions when their contract changes. Hub consumes reviewed local package tarballs rather than copying ownership of the site.

The backend public GET /api/pages, /api/pages/:slug and /api/site contracts remain. They overlay compatible published Hub content and fall back to the verified local snapshot (or last-good in-memory content on a temporary API failure). Set RUA_HUB_PUBLIC_URL to the Hub API origin; production defaults to https://api.rua-labs.com. Explicit empty string disables the overlay for local fixtures. No private token is needed.

Legacy page/site mutations and all /api/users routes return 410. The old admin is an explicit link to Rua Hub. Auth0 SDK/configuration/middleware and the old compiled admin bundle have been removed. Do not restore the previous fail-open write middleware during rollback. This source change does not delete any external Auth0 tenant, user or credential; provider secret cleanup is separate.

Deployment order: Hub multi-project API, Highland compatibility backend + admin, then public frontend if needed. Verify /rua-registry.json on the backend, unchanged public content, and retired endpoints before Hub registration. Reconcile live /api/pages and /api/site against manifest defaults before creating drafts. Registration does not publish; a human administrator reviews and publishes pages and shared settings through Hub.

No submission form or runtime-control adapter is configured. Highland maintenance mode is intentionally unavailable. Do not invent form inbox records or server metrics.

Checks: node --test backend/tests/retirement.test.js, npm run build, and Hub npm run test:multi-project exercise actual rendering, CSS, draft/save/publish/restore and retired endpoints on isolated loopback fixtures. Never use production publication as an automated test.
