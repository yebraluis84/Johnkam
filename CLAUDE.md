@AGENTS.md

# Database Safety Rules

NEVER run any of these commands without explicit user approval:
- `prisma db push` (can silently drop columns and delete data)
- `prisma migrate reset` (wipes the entire database)
- `prisma migrate dev` (creates and runs migrations in dev mode, can be destructive)
- Any raw SQL `DROP TABLE`, `DROP COLUMN`, or `TRUNCATE`
- Any `DELETE FROM` without a WHERE clause

When making schema changes:
- Always use `ADD COLUMN IF NOT EXISTS` in raw SQL migrations
- Never drop columns — mark them as optional in the schema instead
- All migration SQL files must be idempotent (safe to run twice)
- The build script must stay as `prisma generate && next build` — do NOT add migration commands to it

If a migration is needed, write the SQL manually in `prisma/migrations/` and use self-healing SQL in the relevant API route instead of running it at build time.
