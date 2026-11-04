import { Fragment, useState, type ReactNode } from "react";
import { Bell, ChevronDown, ChevronRight, Eye, History, Info, Keyboard, Languages, ListChecks, Palette, RefreshCw, Search, Sparkles, TextCursorInput, Ungroup, Wifi, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SHOW_HIDDEN_DETAIL, SHOW_HIDDEN_TITLE } from "./DeveloperPages";

/**
 * UX-053 (approved 2026-11-01): search in Settings, phone and tablet. The query matches a setting's name and its description; results keep
 * the section name as a group heading so a row can be placed, switches stay operable in place, and the match is highlighted. No
 * results says so and offers Clear search. Developer options rows (UX-052, F1b DEC-063: only Show hidden entries) are in the index only
 * while Developer options are unlocked (DEC-022): a locked app neither lists them nor hints that they exist. Debug rows (performance
 * overlay, feature flags, tools) are tools, not settings: never in the index. Synthetic names only.
 */
export type SettingEntry = { id: string; section: string; title: string; detail: string; icon: LucideIcon; kind: "switch" | "choice" | "link"; on?: boolean; developer?: boolean; platform?: "phone" | "tablet" };

const FIND = (platform: "phone" | "tablet") => platform === "phone" ? "Off: Add unit opens the catalogue for browsing. The keyboard appears when you tap the search." : "Off: Add unit opens the catalogue for browsing. ⌘F (Ctrl + F on Android) on a keyboard always focuses the search.";

export const settingsIndex = (platform: "phone" | "tablet"): SettingEntry[] => ([
  { id: "theme", section: "Appearance", title: "Theme", detail: "System follows the device setting.", icon: Palette, kind: "choice" },
  { id: "transparency", section: "Appearance", title: "Reduce transparency", detail: "Use solid backgrounds for toolbars and controls.", icon: Eye, kind: "switch", platform: "tablet" },
  { id: "colour", section: "Appearance", title: "Colour scheme", detail: "Default, Gilded, Azure, Verdant and imported schemes.", icon: Palette, kind: "choice" },
  { id: "motion", section: "Appearance", title: "Reduce motion", detail: "Use direct transitions instead of spring and shape motion. Device accessibility preferences also apply.", icon: Eye, kind: "switch", platform: "tablet" },
  { id: "language", section: "Language", title: "Language", detail: "Only the app interface is translated. Game data is shown as written.", icon: Languages, kind: "choice" },
  { id: "smart", section: "Search & assistance", title: "Smart search & suggestions", detail: "Type-to-add command bar, fuzzy results, and AI suggestion chips in the add-unit menu.", icon: Sparkles, kind: "switch", platform: "phone" },
  { id: "reopen", section: "Rosters", title: "Reopen roster on launch", detail: "The roster open when you quit opens again.", icon: History, kind: "switch" },
  { id: "remember", section: "Rosters", title: "Remember option sections", detail: "Reopen a unit's option sections as you left them. Off: every visit starts folded; you can still open sections while you are there.", icon: ChevronDown, kind: "switch", on: true },
  { id: "advinstall", section: "Game data", title: "Advanced installation", detail: "Choose which factions to install when you add game data. Off: everything is installed.", icon: ListChecks, kind: "switch" },
  { id: "wifi", section: "Game data", title: "Download on Wi-Fi only", detail: "Wait for Wi-Fi before downloading game data. Update checks still use mobile data.", icon: Wifi, kind: "switch", platform: "phone" },
  { id: "checks", section: "Game data", title: "Check for updates automatically", detail: platform === "phone" ? "Looks for newer game data while the app is open and shows a badge. Never installs on its own." : "When the app is open and online.", icon: RefreshCw, kind: "switch", on: true },
  { id: "keep", section: "Game data", title: "Keep previous versions", detail: "Keep older versions of each source so you can switch back.", icon: History, kind: "choice", platform: "phone" },
  { id: "notify", section: "Game data", title: "Job notifications", detail: "Notifications are off · Open system settings", icon: Bell, kind: "link", platform: "phone" },
  { id: "shortcuts", section: "Keyboard shortcuts", title: "Keyboard shortcuts", detail: "With a hardware keyboard.", icon: Keyboard, kind: "link", platform: "tablet" },
  { id: "focus", section: "Advanced", title: "Focus search when opening the catalogue", detail: FIND(platform), icon: TextCursorInput, kind: "switch" },
  { id: "separate", section: "Advanced", title: "Enable Separate all", detail: "Units with several models also offer Separate all, which gives every model its own options in one step. Off: only Separate 1.", icon: Ungroup, kind: "switch" },
  { id: "about", section: "About", title: "Version and licences", detail: "Version 1.0.0 · open source licences.", icon: Info, kind: "link" },
  { id: "hidden", section: "Developer options", title: SHOW_HIDDEN_TITLE, detail: SHOW_HIDDEN_DETAIL, icon: Eye, kind: "switch", developer: true },
] as SettingEntry[]).filter((entry) => !entry.platform || entry.platform === platform);

/** Entries matching the query in the name or the description, in index order; developer rows only while Developer options are unlocked. */
export function matchSettings(platform: "phone" | "tablet", query: string, developerUnlocked: boolean): SettingEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return settingsIndex(platform).filter((entry) => (!entry.developer || developerUnlocked) && `${entry.title} ${entry.detail} ${entry.section}`.toLowerCase().includes(q));
}

export function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const at = text.toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return text;
  return <>{text.slice(0, at)}<mark className="ux-settings-mark">{text.slice(at, at + q.length)}</mark>{text.slice(at + q.length)}</>;
}

export function SettingsResults({ platform, query, developerUnlocked = false, onClear }: { platform: "phone" | "tablet"; query: string; developerUnlocked?: boolean; onClear: () => void }) {
  const found = matchSettings(platform, query, developerUnlocked);
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(settingsIndex(platform).filter((e) => e.on).map((e) => [e.id, true])));
  if (!query.trim()) return null;
  if (!found.length) return <div className="ux-search-empty ux-settings-empty" role="status"><Search size={19} /><strong>No settings match “{query.trim()}”</strong><small>Try another word, or a part of a name.</small><button type="button" className="ux-job-btn" onClick={onClear}>Clear search</button></div>;
  const sections = [...new Set(found.map((entry) => entry.section))];
  return <div className={`ux-settings-results ${platform}`}>
    <small className="ux-settings-count" role="status">{found.length} {found.length === 1 ? "setting" : "settings"}</small>
    {sections.map((section) => <Fragment key={section}>
      <div className="ux-result-label">{section}</div>
      <div className={platform === "phone" ? "ux-settings-group" : "ux-src-group tb-switches"}>
        {found.filter((entry) => entry.section === section).map((entry) => {
          const Icon = entry.icon;
          const body = <><span className="ux-settings-text"><strong><Highlight text={entry.title} query={query} /></strong><small><Highlight text={entry.detail} query={query} /></small></span></>;
          if (entry.kind === "switch") return <button key={entry.id} type="button" role="switch" aria-checked={!!on[entry.id]} className={`ux-setting-row ux-settings-row ${on[entry.id] ? "on" : ""}`} onClick={() => setOn((s) => ({ ...s, [entry.id]: !s[entry.id] }))}>
            <span className="ux-setting-icon"><Icon size={17} /></span>{body}<span className="ux-switch" aria-hidden /></button>;
          return <button key={entry.id} type="button" className="ux-setting-row ux-settings-row ux-setting-value"><span className="ux-setting-icon"><Icon size={17} /></span>{body}<span className="ux-setting-current"><ChevronRight size={14} /></span></button>;
        })}
      </div>
    </Fragment>)}
  </div>;
}

export function SettingsSearchField({ query, onQuery, onClose }: { query: string; onQuery: (q: string) => void; onClose?: () => void }) {
  return <label className="ux-search tb-search tb-toolbar-search-field"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search settings" aria-label="Search settings" />
    {query ? <button type="button" className="tb-search-clear" aria-label="Clear search" title="Clear search" onClick={() => onQuery("")}><X size={16} aria-hidden="true" /></button> : null}{onClose ? null : null}</label>;
}
