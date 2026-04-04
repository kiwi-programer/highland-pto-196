# Highland PTO Platform

The repo now has three separate pieces:

1. Public site in [frontend/](frontend)
2. Protected admin portal in [admin/](admin)
3. Shared API in [backend/](backend)

The public site reads page content plus shared PTO settings from the API. The admin portal is its own app so it can be hosted separately. Auth0 is dormant by default, so the apps still run if Auth0 has not been configured yet.

## Layout

```text
.
├── admin/
├── backend/
├── frontend/
└── package.json
```

## Local dev

Install dependencies from the repo root:

```bash
npm install
```

Run the public site and API:

```bash
npm run dev
```

Run the admin app separately:

```bash
npm run dev:admin
```

API only:

```bash
npm run dev:backend
```

Build both frontends:

```bash
npm run build
```

## What is editable

The admin portal now manages:

1. Page titles, summaries, content, and ordering
2. Shared PTO contact email
3. Committee contact names and emails
4. Executive board names, roles, initials, and bios
5. Footer links and key outbound URLs

Shared settings live in [backend/data/site.json](backend/data/site.json). Public page body text can reference `{{contactEmail}}`, `{{organizationName}}`, `{{district}}`, `{{location}}`, `{{donateUrl}}`, and `{{volunteerUrl}}`.

## API

Base URL: `http://localhost:4000/api`

Public reads:

1. `GET /health`
2. `GET /pages`
3. `GET /pages/:slug`
4. `GET /site`

Write endpoints:

1. `POST /pages`
2. `PUT /pages/:slug`
3. `PUT /site`

When `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` are set, write endpoints require an Auth0 access token with the `admin:write` scope. Until then, auth middleware is bypassed.

## Auth0 setup

1. Create an Auth0 application of type Single Page Application for the admin portal.
2. Create an Auth0 API for this backend and set the audience to match `AUTH0_AUDIENCE`.
3. Add the `admin:write` permission or scope to the API and enable RBAC if you want permission claims in the token.
4. Add these callback URLs to the Auth0 app:
   - `http://localhost:5174`
   - your production admin URL
5. Add logout URLs for the same hosts.
6. Set environment variables:

```text
backend: AUTH0_DOMAIN, AUTH0_AUDIENCE
admin: VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE, VITE_AUTH0_REDIRECT_URI
frontend: VITE_ADMIN_URL, VITE_API_BASE_URL
```

7. Once Auth0 is configured, log into the admin portal and it will include an access token automatically when saving pages or site settings. If Auth0 is not set up yet, the admin portal stays open and the backend allows writes without token checks.

## Deployment

1. Deploy [frontend/](frontend) as the public site.
2. Deploy [admin/](admin) as a separate app or subdomain.
3. Deploy [backend/](backend) as the API.
4. Point each frontend at the backend with `VITE_API_BASE_URL`. Use the backend origin or the full `/api` URL; the app will normalize either form.
5. Point the public site at the admin app with `VITE_ADMIN_URL`.

## Notes

1. The public app no longer contains the admin editor.
2. Contact names and links are no longer hardcoded in the public JSX.
3. Page body content can use template tokens so the PTO can change contact details centrally.
4. Auth0 is optional for now and can be enabled later by setting the environment variables above.