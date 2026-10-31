import { useState } from "react";
import { lookupGroups, lookupSystems, searchLookup, type LookupGroupId } from "../../data/lookupData";

/**
 * Lookup 1.0 search state shared by the phone, tablet and desktop designs: name search over every installed system or
 * the chosen ones, results in four groups. Units start open; with no units the first group with results opens. Open
 * sections come first and folded ones sort below them (fixed group order inside each part). Fold state lasts for the
 * search; clearing the field resets it.
 */
export function useLookup(initialQuery: string) {
  const [query, setQueryState] = useState(initialQuery);
  const [systems, setSystems] = useState<string[] | null>(null);
  const [open, setOpen] = useState<LookupGroupId[] | null>(null);
  const results = searchLookup(query, systems);
  const allResults = searchLookup(query, null);
  const groups = lookupGroups.map((g) => ({ ...g, rows: results.filter((e) => e.group === g.id) })).filter((g) => g.rows.length > 0);
  const defaultOpen: LookupGroupId[] = groups.some((g) => g.id === "unit") ? ["unit"] : groups.slice(0, 1).map((g) => g.id);
  const openIds = open ?? defaultOpen;
  const ordered = [...groups.filter((g) => openIds.includes(g.id)), ...groups.filter((g) => !openIds.includes(g.id))];
  return {
    query, systems, results, allResults, ordered, openIds,
    typed: query.trim().length > 0,
    /** Whether rows name the system: when results can come from more than one. */
    withSystem: systems === null ? lookupSystems.length > 1 : systems.length > 1,
    setQuery: (next: string) => { setQueryState(next); if (!next.trim()) setOpen(null); },
    setSystems,
    toggle: (id: LookupGroupId) => setOpen(openIds.includes(id) ? openIds.filter((x) => x !== id) : [...openIds, id]),
    pickSystem: (name: string) => {
      const current = systems ?? [];
      const next = current.includes(name) ? current.filter((s) => s !== name) : [...current, name];
      setSystems(next.length === 0 || next.length === lookupSystems.length ? null : next);
    },
    countIn: (system: string) => allResults.filter((e) => e.system === system).length,
  };
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
