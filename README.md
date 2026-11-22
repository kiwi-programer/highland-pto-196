# Highland PTO

The public React website remains in `frontend/`, using its original components and styles. Developers can continue editing that source independently. Rua Hub manages published content and authorization; Authentik owns sign-in and identities. This application no longer uses Auth0.

## Content and administration

Use [Highland in Rua Hub](https://hub.rua-labs.com/cms?project=highland-pto-196) for page drafts, previews, publication, revisions and restoration. Contact details, committees and homepage board cards are managed through **Shared site settings**. The **Board page** is a separate published document. Save a draft, then explicitly publish the document you changed. Restoring a revision creates a draft; publish it to restore public content.

[Users & Access](https://hub.rua-labs.com/settings/access) manages organization membership, project assignments, invitations and revocation. Invitation links require a matching verified authenticated email. No email delivery is configured; administrators share the displayed one-time link themselves. No passwords are stored by this application.

The old `admin/` application was already a notice linking to Rua Hub. It is now a small static compatibility landing page without a React/router runtime, API proxy or Auth0 settings. Existing admin URLs remain usable. Its old page editor and user management are not restored. The deployed landing page should be updated only after the Rua Hub replacement is released and verified.

## Backend retained

`backend/` is still required by the public frontend. It exposes read-only compatibility `/api/pages`, `/api/pages/:slug`, `/api/site`, `/api/health` and `/rua-registry.json`. Published Rua Hub documents overlay the versioned JSON defaults, with last-good caching on upstream failure. This allows the public website to remain functional when the administrative frontend or upstream content service is unavailable. Public reads use no service tokens or administrator credentials. Legacy writes and `/api/users` return 410 and direct callers to Rua Hub. There is no private account provisioning, form processor or Auth0 management API in this backend. Do not shut it down while the frontend still depends on it.

Public content reads bypass intermediate caches. Returning to an open website tab refreshes published content. Unpublished pages/settings retain existing fallback content. Publishing does not rebuild or replace the visual design.

## Development and deployment

Run `npm ci`, then `npm run dev` for public frontend plus compatibility API. `npm run build` builds the public frontend and static admin landing page; `npm run build:backend` checks backend syntax; `npm test --workspace backend` runs isolated backend tests. `npm run package:hub` rebuilds the original React/CSS renderer used by Puck in Rua Hub.

Deploy frontend, backend and compatibility admin separately using their existing Vercel project roots. Set `VITE_API_BASE_URL` on the public frontend to the compatibility backend origin, and `RUA_HUB_PUBLIC_URL` on the backend to the Rua Hub public API origin. The admin landing page needs no environment settings. Do not remove the backend or its fallback JSON. Existing production credentials should be removed from hosting configuration separately if obsolete; this change does not access or revoke provider accounts.

## Verification and recovery

The 3.1 staging tests cover draft/save/publish, return-to-tab refresh, structured shared settings, revision restoration and republishing using the actual Highland React renderer. Original website CSS is compared in the browser tests. Production's existing Board publication was traced read-only through Rua Hub, the compatibility API and `/board`; its content already agreed. Homepage cards use the separately published settings document.

Roll back website refresh behavior by reverting the website release if necessary; public fallback files remain intact. Never use direct database writes or scoped service tokens to publish. Keep Rua Hub 3.1 authorization in place after external organization users are enabled; rolling its API back to 3.0 would remove the new access controls.
