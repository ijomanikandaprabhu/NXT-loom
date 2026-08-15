/**
 * Applies every db/*.sql file in filename order, once each.
 *
 * Deliberately not a migration framework — at this size a framework is more
 * moving parts than it saves. Each file runs inside a transaction and is
 * recorded, so re-running is safe and only new files execute.
 *
 *   node scripts/migrate.mjs           apply pending
 *   node scripts/migrate.mjs --status  list without applying
 */
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { splitStatements } from "./sql-split.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.DATABASE_URL;

if (!url) {
  console.error(
    "DATABASE_URL is not set.\n\n" +
      "Copy .env.example to .env and paste your Neon connection string into it.\n" +
      "The .env file is gitignored — do not commit the string or paste it into chat."
  );
  process.exit(1);
}

const sql = neon(url);
const statusOnly = process.argv.includes("--status");

await sql`
  create table if not exists schema_migration (
    filename    text primary key,
    applied_at  timestamptz not null default now()
  )
`;

const applied = new Set(
  (await sql`select filename from schema_migration`).map((r) => r.filename)
);

const files = (await readdir(join(root, "db")))
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (statusOnly) {
  for (const f of files) console.log(`${applied.has(f) ? "applied" : "pending"}  ${f}`);
  process.exit(0);
}

let ran = 0;
for (const file of files) {
  if (applied.has(file)) continue;
  const body = await readFile(join(root, "db", file), "utf8");
  process.stdout.write(`applying ${file} ... `);
  try {
    // The HTTP driver sends one statement per call, so the file is split. A
    // naive split on ";" would break on semicolons inside string literals or
    // dollar-quoted bodies, so those are stripped from consideration first.
    await sql.transaction(
      splitStatements(body).map((stmt) => sql.query(stmt))
    );
    await sql`insert into schema_migration (filename) values (${file})`;
    console.log("ok");
    ran++;
  } catch (err) {
    console.log("failed");
    console.error(err.message);
    process.exit(1);
  }
}

console.log(ran ? `\n${ran} migration(s) applied.` : "\nNothing to apply — schema is current.");
