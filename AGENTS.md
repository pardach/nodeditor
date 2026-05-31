# AGENTS.md

## Cursor Cloud specific instructions

**Node Vector Studio** is a single-package, client-only React/Vite app. There is no backend, database, or Docker stack.

### Services

| Service | Port | Command |
|---------|------|---------|
| Vite dev server | 5173 | `npm run dev` |
| Vite preview (after build) | 4173 | `npm run preview` |

Only the Vite dev server is required for interactive development and manual testing.

### Common commands

See `README.md` for the canonical workflow:

- `npm install` — install dependencies
- `npm run dev` — dev server with HMR
- `npm test` — Vitest unit tests (no extra services)
- `npm run build` — `tsc --noEmit` then production bundle

There is no separate ESLint script in `package.json`; typechecking is part of `npm run build`.

### Dev server notes

- Vite binds to `localhost:5173` by default (`vite.config.ts` does not override host/port).
- For browser access from outside the dev container, you may need `npm run dev -- --host` (not required for normal local/cloud VM testing on localhost).
- Use a tmux session (e.g. `vite-dev-server`) for long-running `npm run dev`; do not rely on one-shot background shells.

### Hello-world manual check

1. Open http://localhost:5173/
2. Confirm the SVG viewport shows the sample rectangle and the node graph is visible.
3. With a fill node selected in the Inspector, change a color channel and confirm the viewport updates.
4. Use Undo to revert the change.

### Tests

Vitest runs in-process with jsdom; no browser or dev server is required for `npm test`.
