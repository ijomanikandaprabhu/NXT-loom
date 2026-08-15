/** Splits a SQL file into statements, respecting quotes and dollar-quoting. */
export function splitStatements(text) {
  const out = [];
  let buf = "";
  let i = 0;
  let quote = null; // "'", '"', or a dollar tag like $$ / $fn$
  while (i < text.length) {
    const ch = text[i];

    if (!quote && ch === "-" && text[i + 1] === "-") {
      const nl = text.indexOf("\n", i);
      i = nl === -1 ? text.length : nl;
      continue;
    }
    if (!quote && (ch === "'" || ch === '"')) {
      quote = ch;
    } else if (!quote && ch === "$") {
      const tag = /^\$[A-Za-z_]*\$/.exec(text.slice(i));
      if (tag) {
        quote = tag[0];
        buf += quote;
        i += quote.length;
        continue;
      }
    } else if (quote && quote.length === 1 && ch === quote) {
      if (text[i + 1] === quote) {
        // '' inside a string is an escaped quote, not the end of one. Both
        // characters are consumed together so the cursor cannot stall on the
        // second and re-read it as a fresh opening quote.
        buf += ch + ch;
        i += 2;
      } else {
        quote = null;
        buf += ch;
        i++;
      }
      continue;
    } else if (quote && quote.length > 1 && text.startsWith(quote, i)) {
      buf += quote;
      i += quote.length;
      quote = null;
      continue;
    }

    if (!quote && ch === ";") {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}
