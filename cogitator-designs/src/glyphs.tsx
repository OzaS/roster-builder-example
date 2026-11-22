import { CircleAlert, CirclePlus, FileDiff, Flag, Lightbulb, ListTree, Package, ScrollText, Tag, Table2, User, Users, Coins, BookOpen } from "lucide-react";
import type { DiagKind, Kind } from "./sample";

/** One glyph per declaration kind (the Battle Augur category-symbol idea), so long trees scan without colour. */
export function KindIcon({ kind, size = 14 }: { kind: Kind; size?: number }) {
  const props = { size, strokeWidth: 1.75, "aria-hidden": true } as const;
  switch (kind) {
    case "unit": return <Users {...props} />;
    case "model": return <User {...props} />;
    case "upgrade": return <CirclePlus {...props} />;
    case "group": return <ListTree {...props} />;
    case "rule": return <ScrollText {...props} />;
    case "category": return <Tag {...props} />;
    case "force": return <Flag {...props} />;
    case "profile-type": return <Table2 {...props} />;
    case "cost-type": return <Coins {...props} />;
    case "system": return <BookOpen {...props} />;
    default: return <Package {...props} />;
  }
}

/** Diagnostic kinds differ by shape as well as colour: error (circle), preservation failure (diff page), suggestion (bulb). */
export function DiagIcon({ kind, size = 14 }: { kind: DiagKind; size?: number }) {
  const props = { size, strokeWidth: 2, "aria-hidden": true, className: `fc-diag-icon ${kind}` } as const;
  if (kind === "error") return <CircleAlert {...props} />;
  if (kind === "preservation") return <FileDiff {...props} />;
  return <Lightbulb {...props} />;
}
