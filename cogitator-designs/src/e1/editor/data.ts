import { diagnostics, type DiagKind, type Diagnostic } from "../../sample";

/**
 * E1 editor screens (part B): the DKLPO text of the sample modules and the diagnostics placed in it.
 * Synthetic "Demo Skirmish" content only (DEC-001); the text matches Direction D's pages (`direction-d-content.tsx`).
 */

export type ModuleText = { id: string; name: string; path: string; layer: string; lines: string[] };

const text = (body: string) => body.replace(/^\n/, "").replace(/\n$/, "").split("\n");

export const ironWardens: ModuleText = {
  id: "iron-wardens", name: "Iron Wardens", path: "iron-wardens/module.dkl", layer: "Base",
  lines: text(`
## Synthetic faction. Invented content only.
catalogue iron-wardens
  revision 18
  system demo-skirmish 3
  author: Example Author

root use warden-squad
  cat line*

root use warden-captain
  cat leader*

unit warden-squad
  # review: second pass
  x-bs.exampleReviewState: draft
  cat infantry
  use shield-wall
  cost pts 20
  model warden 5..10
    cost pts 8
    profile warden: fighter | 5" | 3 | 1
    upgrade banner ..1
      hide when no(warden-captain in force, deep)
      cost pts 10
    group weapon 1 default spear
      use spear
      use halberd

unit warden-captain
  cat leader
  association leads 0..1 to warden-squad in force
    label $
  cost pts 45
  model captain 1
    cost pts 0
    profile captain: fighter | 6" | 4 | 2
    group weapon 1 default halberd
      use halberd
      use spear

upgrade spear
  profile spear: weapon | 2 | 3
  cost pts 0

upgrade halberd
  profile halberd: weapon | 1 | 4
  cost pts 2

unit warden-archers
  cat infantry
  cost pts 22
  model archer 5..10
    cost pts 9
    use longbow

upgrade longbow
  profile longbow: weapon | 24 | 3
  cost pts 4
`),
};

export const frostWardens: ModuleText = {
  id: "frost-wardens", name: "Frost Wardens", path: "frost-wardens/module.dkl", layer: "Frost Wardens",
  lines: text(`
## Frost Wardens: a homebrew content variant. Invented content only.
catalogue frost-wardens
  revision 1
  system demo-skirmish 3
  import iron-wardens

root use ice-guard
  cat line*

root use frost-seer
  cat leader*

unit ice-guard
  cat infantry
  cat line
  cost pts 24
  model guard 3..6
    cost pts 9
    profile guard: fighter | 5" | 3 | 2
    group weapon 1 default rime-blade
      use rime-blade
      use iron-wardens:halbred

# No en text yet: the name shows as the key.
unit frost-seer
  use demo-skirmish:shield-wall
  cost pts 50
  model seer 1
    cost pts 0
    profile seer: fighter | 5" | 2 | 3

upgrade rime-blade
  profile rime-blade: weapon | 1 | 3
  cost pts 3
`),
};

/** Frost Wardens with one bad indentation (3 spaces): the module doesn't parse, so it opens as text only. */
export const frostBroken: ModuleText = {
  ...frostWardens,
  lines: frostWardens.lines.map((line) => (line === "    cost pts 9" ? "   cost pts 9" : line)),
};

export const houseRules: ModuleText = {
  id: "demo-skirmish-house", name: "House rules", path: "house-rules/house/patch.dkl", layer: "House rules",
  lines: text(`
## A club's house rules over the base. Invented content only.
patch house
  target iron-wardens >=18
  title: House rules

set warden-squad.cost.pts 20 -> 18

set warden-squad/trooper/banner.cost.pts 10 -> 5
`),
};

export const modulesById: Record<string, ModuleText> = { "iron-wardens": ironWardens, "frost-wardens": frostWardens, "demo-skirmish-house": houseRules };

/* ---------- Diagnostics: the sample's seven plus three more, so the inbox shows its grouping and a bulk fix ---------- */

export const extraDiagnostics: Diagnostic[] = [
  { id: "d8", kind: "error", code: "patch-path-missing", where: "demo-skirmish-house:house", message: "Patch path `warden-squad/trooper/banner` matches nothing", fix: "Change to `warden-squad/warden/banner`", layer: "House rules" },
  { id: "d9", kind: "suggestion", code: "default-value", where: "iron-wardens:warden-captain/captain", message: "`cost pts 0` is the default", fix: "Remove line", layer: "Base" },
  { id: "d10", kind: "suggestion", code: "default-value", where: "frost-wardens:frost-seer/seer", message: "`cost pts 0` is the default", fix: "Remove line", layer: "Frost Wardens" },
];
export const allDiagnostics: Diagnostic[] = [...diagnostics, ...extraDiagnostics];

/** Where each diagnostic sits in the text: the module, the line holding `match` (after `after`, if given) and the marked text. */
const placement: Record<string, { module: string; match: string; mark?: string; after?: string }> = {
  d1: { module: "frost-wardens", match: "use iron-wardens:halbred", mark: "iron-wardens:halbred" },
  d2: { module: "iron-wardens", match: "# review: second pass" },
  d4: { module: "iron-wardens", match: "x-bs.exampleReviewState: draft", mark: "x-bs.exampleReviewState" },
  d5: { module: "iron-wardens", match: "cost pts 0", after: "upgrade spear" },
  d6: { module: "frost-wardens", match: "unit frost-seer", mark: "frost-seer" },
  d7: { module: "iron-wardens", match: "label $" },
  d8: { module: "demo-skirmish-house", match: "set warden-squad/trooper/banner.cost.pts 10 -> 5", mark: "warden-squad/trooper/banner" },
  d9: { module: "iron-wardens", match: "cost pts 0", after: "model captain 1" },
  d10: { module: "frost-wardens", match: "cost pts 0", after: "model seer 1" },
};

export type Placed = Diagnostic & { module: string; line: number; from: number; to: number };

/** Line numbers are 1-based; `from` / `to` are 0-based columns (to exclusive). */
export function place(d: Diagnostic, lines?: string[]): Placed | undefined {
  const spot = placement[d.id];
  if (!spot) return undefined;
  const source = lines ?? modulesById[spot.module]?.lines;
  if (!source) return undefined;
  const start = spot.after ? source.findIndex((line) => line.trim() === spot.after) : 0;
  const index = source.findIndex((line, i) => i >= start && line.trim() === spot.match);
  if (index < 0) return undefined;
  const line = source[index];
  const mark = spot.mark ?? spot.match;
  const from = line.indexOf(mark);
  return { ...d, module: spot.module, line: index + 1, from, to: from + mark.length };
}

export const placedIn = (module: string, lines?: string[]) =>
  allDiagnostics.map((d) => place(d, lines)).filter((p): p is Placed => Boolean(p && p.module === module));

/** 1-based line of the first line whose trimmed text is `match` (after `after`). */
export function lineOf(module: ModuleText, match: string, after?: string) {
  const start = after ? module.lines.findIndex((line) => line.trim() === after) : 0;
  return module.lines.findIndex((line, i) => i >= start && line.trim() === match) + 1;
}

/** The last line of the block that the statement at `line` opens (its deeper-indented lines that follow). */
export function blockEnd(lines: string[], line: number) {
  const indent = (s: string) => s.length - s.trimStart().length;
  const own = indent(lines[line - 1]);
  let end = line;
  for (let i = line; i < lines.length; i += 1) {
    if (!lines[i].trim()) break;
    if (indent(lines[i]) <= own) break;
    end = i + 1;
  }
  return end;
}

export const kindOrder: DiagKind[] = ["error", "preservation", "suggestion"];
export const kindHeading: Record<DiagKind, string> = { error: "Errors", preservation: "Preservation failures", suggestion: "Authoring suggestions" };
export const plain = (text: string) => text.replace(/`/g, "");
