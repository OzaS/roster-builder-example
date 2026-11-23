/**
 * A small DKLPO highlighter for the mock text editor: enough of the lexical syntax to colour the sample modules
 * (statement keywords, declaration keys, references, strings and text values, comments, numbers and ranges).
 * Not a parser; the product uses the shared engine's lexer.
 */
export type SynClass = "kw" | "key" | "ref" | "str" | "com" | "num" | "punct" | "";
export type Tok = { text: string; c: SynClass };

const multi = ["root use", "hide when", "show when"];
const declares = new Set(["catalogue", "system-def", "dataset", "unit", "model", "upgrade", "group", "association", "patch", "text", "entry", "force", "rule", "category"]);
const refers = new Set(["use", "root use", "cat", "import", "system", "target", "set", "requires"]);
const keywords = new Set([...declares, ...refers, "cost", "profile", "label", "revision", "hide when", "show when", "slot", "min", "max", "sort", "hidden", "drop", "remove", "edit", "x-bs.absent", "x-bs.element", "dklpo"]);
const words = new Set(["to", "in", "force", "deep", "default", "and", "or", "as", "action", "when"]);
const fns = new Set(["no", "any", "all", "count"]);

const lexer = /("[^"]*")|(\^?\d+\.\.\d+|\.\.\d+|\d+\.\.|>=\d+(?:\.\d+)*|\^?\d+(?:\.\d+)*"?)|(->|\||:)|([A-Za-z$*][\w./$*-]*(?::[a-z][\w./$*-]*)?)|(\s+)|(.)/g;

export function tokenize(line: string): Tok[] {
  const indent = line.length - line.trimStart().length;
  const out: Tok[] = [];
  if (indent) out.push({ text: line.slice(0, indent), c: "" });
  const body = line.slice(indent);
  if (!body) return out;
  if (body.startsWith("#")) return [...out, { text: body, c: "com" }];

  // `key: text` lines (fields, extension keys): the key, then the value as a string.
  const field = body.match(/^([a-z][\w.-]*):(\s.*)?$/);
  if (field && !keywords.has(field[1])) {
    out.push({ text: field[1], c: "key" }, { text: ":", c: "punct" });
    if (field[2]) out.push({ text: field[2], c: "str" });
    return out;
  }

  let kw = multi.find((m) => body === m || body.startsWith(`${m} `));
  if (!kw) kw = body.split(/[\s(]/)[0];
  const known = keywords.has(kw);
  out.push({ text: kw, c: known ? "kw" : "" });
  const rest = body.slice(kw.length);
  let firstIdent = true;
  const parts: Tok[] = [];
  for (const m of rest.matchAll(lexer)) {
    const [text, str, num, punct, ident] = m;
    if (str) parts.push({ text, c: "str" });
    else if (num) parts.push({ text, c: "num" });
    else if (punct) parts.push({ text, c: "punct" });
    else if (ident) {
      let c: SynClass = "ref";
      if (words.has(ident) || fns.has(ident)) c = "kw";
      else if (ident === "$") c = "str";
      else if (kw === "profile" || declares.has(kw)) c = firstIdent ? "key" : "ref";
      else if (kw === "revision") c = "num";
      parts.push({ text, c });
      firstIdent = false;
    } else parts.push({ text, c: "" });
  }
  return [...out, ...parts];
}

/** Per-character classes for a line (so diagnostics, the caret and selections can split tokens anywhere). */
export function charClasses(line: string): SynClass[] {
  const classes: SynClass[] = [];
  for (const tok of tokenize(line)) for (let i = 0; i < tok.text.length; i += 1) classes.push(tok.c);
  return classes;
}
