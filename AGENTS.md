# Repository Guidelines

## Project Structure & Module Organization
- `app/` drives the App Router; `app/page.tsx` is the landing experience, while route handlers live under `app/api/**` and `middleware.ts` manages auth gates.
- `components/` collects reusable client components; prefer feature folders for related UI.
- `lib/` centralizes shared logic: `lib/auth` for JWT flows, `lib/db` for Sequelize (`migrations/`, `models/`, `seeders/`), `lib/email` for mailers, and `lib/env.ts` for runtime validation.
- `public/` stores static assets referenced via `next/image`; keep large media out of git history.
- `.sequelizerc` and `scripts/sync-db.ts` point CLI tasks at the `lib/db` directory.

## Build, Test, and Development Commands
- `npm run dev`: start Next.js with Turbopack on `http://0.0.0.0:3000`.
- `npm run build`: compile the production bundle and surface type errors.
- `npm run start`: serve the compiled build locally.
- `npm run lint`: run ESLint with the `next/core-web-vitals` ruleset.
- `npm run db:migrate|db:seed|db:reset`: manage the Postgres schema and seed baseline data (`001-roles`, `002-settings`, `003-sample-content`).

## Coding Style & Naming Conventions
- TypeScript runs in strict mode; prefer typed hooks and helpers, avoid `any`, and resolve ESLint warnings before merging.
- Components live in `.tsx` files and use PascalCase; hooks/utilities use camelCase and colocate with their feature.
- Stick to 2-space indentation, trailing commas, and single quotes in client modules; run your editor's ESLint integration before committing.
- Tailwind utility classes belong in JSX; share tokens in `app/globals.css` when repetition appears.

## Testing Guidelines
- No automated runner is wired yet; cover new work with targeted manual scripts and note the steps in your PR.
- For data changes, update Sequelize migrations/seeders and test with `npm run db:reset` against a local Postgres instance.
- When adding tests, colocate `*.spec.ts(x)` files with the code or under `__tests__/` and ensure they are Turbopack-compatible.

## Commit & Pull Request Guidelines
- Follow the existing history: short, imperative subjects (e.g., `optimize hero render`) capped near 60 characters.
- Each PR must describe scope, list test evidence, link related issues, and include UI screenshots or clips when screens change.
- Ensure lint passes and all migrations/seeders ship in the diff; call out new `.env.local` keys explicitly.

## Configuration & Secrets
- Keep sensitive values in `.env.local`; `lib/env.ts` validates Supabase, Postgres, SMTP, and JWT keys during startup.
- Never commit `.env*`; document new keys in the PR and update the shared secrets manager promptly.
