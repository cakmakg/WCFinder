# GitHub Copilot / AI Agent Instructions for WCFinder

This file gives compact, actionable info to make AI coding agents productive immediately in this repo.

## Quick Architecture (big picture)
- CLIENT (React + Vite) talking to SERVER (Express.js + MongoDB) over HTTPS. See `CLIENT/docs/ARCHITECTURE.md` and `README.md` for diagrams.
- SERVER follows MVC-ish organization: `src/routes` → `src/controller` → `src/services` → `src/models`.
- Payments use Stripe and PayPal (`SERVER/src/services/paymentService.js`, `SERVER/src/routes/payment.js`). Webhooks are separate routes that must bypass regular auth.

## How to run / dev commands
- Backend (recommended):
  - cd `SERVER` && `npm install` then `npm run dev` (runs `swaggerAutogen.js` then `nodemon index.js`).
  - `npm run start` to run production entry (`node index.js`).
- Frontend:
  - cd `CLIENT` && `npm install` then `npm run dev` (Vite).
- Useful script folder: `SERVER/scripts/` — e.g. `create-admin.js`, `create-user.js`, `test-user-auth.js` (run them from `SERVER`).

## Important conventions & patterns
- Module types: CLIENT is ESM (`"type": "module"`), SERVER is CommonJS (`"type": "commonjs"`). Match module style when editing.
- Auth & permissions: middleware lives in `SERVER/src/middleware/`:
  - `authentication.js` parses `Authorization` header (supports JWT and SimpleToken)
  - `permissions.js` provides `isLogin`, `isAdmin`, `isOwnerOrAdmin`, `isSelfOrAdmin` — use them on routes.
- Validation & sanitation: centralized in `SERVER/src/middleware/validation.js`. Always use these validators for user input.
- Error types: use `Error` subtypes in `SERVER/src/middleware/errorHnadler.js` (e.g., `AuthenticationError`, `AuthorizationError`).
- Dependency-injection-friendly: see `SERVER/src/utils/container.js` / `dependencyInjection.js` — tests and controllers mock services here.

## Security-sensitive handling
- Environment config: refer to `SERVER/.env.example` and `CLIENT/.env.example` for the required vars (DB, JWT keys, STRIPE, PAYPAL, EMAIL_*).
- Logging: Authorization header masking is implemented (`SERVER/src/utils/passwordMasker.js`) — avoid logging secrets.
- Webhook endpoints: payment webhooks intentionally bypass auth (see `SERVER/src/routes/payment.js` -> `/webhook/stripe`). When adding webhooks, ensure correct verification (Stripe webhook secret) and no auth middleware.
- Rate limiting: payment endpoints use `paymentRateLimit` middleware — preserve it for anti-abuse.

## Adding endpoints / controllers (recommended flow)
1. Add a route in `SERVER/src/routes/*` and register it in `SERVER/src/routes/index.js`.
2. Add controller function in `SERVER/src/controller/*` using existing patterns (dependency injection where appropriate).
3. Use validators from `middleware/validation.js` and permissions from `middleware/permissions.js`.
4. Add or update service logic in `SERVER/src/services/*` and repository code in `SERVER/src/repositories/*` if DB access is needed.
5. To update API docs, run the backend dev command (it runs `swaggerAutogen.js` to regenerate `src/configs/swagger.json`) and verify Swagger UI at `/documents/swagger`.

## Tests & scripts
- There are script utilities under `SERVER/scripts/` for seeding and quick verification — use them for manual testing (e.g., create admin or demo owner).
- Note: repository currently documents `npm test` in README but there are no headless test scripts in package.json; if adding tests, prefer dependency-injection-friendly unit tests for controllers/services and integration tests for routes.

## Where to look for examples
- Payment flows: `SERVER/src/services/paymentService.js` and `SERVER/src/routes/payment.js` (shows create/confirm/webhook patterns).
- Auth flows: `SERVER/src/controller/auth.js` and `SERVER/src/middleware/authentication.js` (login, refresh, reset flows). Also see `SERVER/scripts/test-user-auth.js` for examples.
- Data models & indexing examples: `SERVER/src/models/*` and `CLIENT/docs/ARCHITECTURE.md` for expected shapes.

## PR & formatting notes
- Follow existing code style (JS + readable comments, many comments are Turkish). Keep commits focused and add tests when changing logic that affects auth/payments.
- When touching APIs: update Swagger by running the backend dev flow and include a short entry in docs if behavior changed.

---
If anything is unclear or you'd like more detail on a specific area (payments, auth, CI/tests, or adding automated tests), tell me which section to expand. 🙌
