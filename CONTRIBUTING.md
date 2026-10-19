# Contributing

## Development workflow

1. Use the existing frontend and backend packages; avoid replacing working features or changing saved setting IDs without a migration.
2. Install dependencies with `npm ci` in the package you are changing.
3. Keep secrets in ignored `.env` files. Update the relevant `.env.example` when adding a required variable, using placeholders only.
4. Run `npm run lint` and `npm run build` in `Frontend/` for frontend changes. Run `npm test` in `Backend/` for backend changes.
5. For data-changing API work, verify ownership checks, validation, and effects on related XP, streak, and session records.

## Code guidelines

- Preserve the existing visual design, routes, API response contracts, and stored user progress unless a verified defect requires a change.
- Validate inputs on the server and scope user-owned database queries to the authenticated user.
- Keep audio controls independent from visual theme and ambience controls.
- Add focused tests for new business rules and regression fixes when the current test setup supports them.
- Document behavior or environment changes in the root README and example environment files.
