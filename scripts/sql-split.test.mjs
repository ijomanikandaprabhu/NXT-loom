/** Checks the splitter against the real migration files and the cases that break naive splitting. */
import { readFile } from "node:fs/promises";
import { splitStatements } from "./sql-split.mjs";

let failed = 0;
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) { console.log("   got :", JSON.stringify(got)); console.log("   want:", JSON.stringify(want)); failed++; }
};

check("plain", splitStatements("select 1; select 2;"), ["select 1", "select 2"]);
check("semicolon inside a string", splitStatements("insert into t values ('a;b');"), ["insert into t values ('a;b')"]);
check("escaped quote", splitStatements("select 'it''s fine; really';"), ["select 'it''s fine; really'"]);
check("comment with apostrophe and semicolon",
  splitStatements("-- a tenant's row; ignored\nselect 1;"), ["select 1"]);
check("dollar quoted body",
  splitStatements("create function f() returns int as $$ begin return 1; end $$ language plpgsql;"),
  ["create function f() returns int as $$ begin return 1; end $$ language plpgsql"]);
check("trailing statement without semicolon", splitStatements("select 1"), ["select 1"]);

for (const f of ["db/001_identity.sql", "db/002_seed.sql"]) {
  const stmts = splitStatements(await readFile(f, "utf8"));
  const bad = stmts.filter((s) => !s.trim() || s.trim().startsWith("--"));
  console.log(`${bad.length === 0 ? "PASS" : "FAIL"}  ${f} -> ${stmts.length} statements, ${bad.length} malformed`);
  if (bad.length) failed++;
  if (f.endsWith("002_seed.sql")) {
    const emoji = stmts.some((s) => s.includes("🇮🇩"));
    console.log(`${emoji ? "PASS" : "FAIL"}  flag emoji survived splitting`);
    if (!emoji) failed++;
  }
}

process.exit(failed ? 1 : 0);
