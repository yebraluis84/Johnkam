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

# Schema Change Deployment Reminder

Vercel does NOT run migrations — `prisma generate` only builds the client, it does not alter the database. Every time a new column or table is added to `schema.prisma`, you MUST:

1. Add a corresponding `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statement to `/src/app/api/fix-schema/route.ts`
2. **Tell the user** they need to visit `/api/fix-schema` on production after deploying, or run the ALTER TABLE manually in Neon's SQL editor
3. Never assume the database has the new column just because the schema file was updated

This is a BLOCKING requirement — do not mark schema work as done without reminding the user about this step.
