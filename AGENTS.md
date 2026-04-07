# Repository Guidelines

## Project Structure & Module Organization
This project is a Vite + Vue 3 frontend app (`job-tracker`). Keep feature logic close to views and shared logic in dedicated folders.

- `src/main.js`: app bootstrap.
- `src/App.vue`: root layout and router outlet.
- `src/views/`: page-level features (e.g., `Dashboard.vue`, `ApplicationList.vue`).
- `src/router/index.js`: route definitions.
- `src/api/index.js`: browser-side data access wrappers.
- `src/data/`: static datasets.
- `src/styles/`: global CSS variables and transitions.
- `public/`: static assets served as-is.
- `plugins/` and `.agents/`: local Codex plugin/skill integration.

## Build, Test, and Development Commands
Run commands from repository root:

- `npm install`: install dependencies.
- `npm run dev`: start local dev server (Vite, host enabled).
- `npm run build`: generate production build into `dist/`.
- `npm run start`: preview production build locally.
- `启动.bat` (Windows): convenience launcher for local development.

## Coding Style & Naming Conventions
- Use 2-space indentation for JS, Vue SFC blocks, and CSS.
- Prefer Vue Composition API patterns already present in the codebase.
- Name Vue view files in `PascalCase` (e.g., `InterviewRecords.vue`).
- Use `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants.
- Keep CSS tokens in `src/styles/variables.css`; avoid hard-coded repeated colors.
- Follow existing import ordering: framework libs, then local modules.

## Testing Guidelines
There is currently no automated test framework configured. For each change:

- Manually verify affected pages via `npm run dev`.
- Run `npm run build` before opening a PR to catch compile-time issues.
- For bug fixes, document reproduction and validation steps in the PR description.

## Commit & Pull Request Guidelines
Git history shows mixed styles; prefer a consistent Conventional Commit format:

- `feat: add interview round filter`
- `fix: correct dashboard sorting`
- `optimize: reduce table re-rendering`

PRs should include:

- Clear summary of what changed and why.
- Linked issue/task (if available).
- UI screenshots or short recordings for view changes.
- Verification notes (manual checks and `npm run build` result).
