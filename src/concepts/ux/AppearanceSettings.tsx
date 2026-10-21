import { AlertTriangle, Check, Languages, LoaderCircle, Palette, Upload, X } from "lucide-react";
import { useState } from "react";
import type { ConceptProps } from "../shared";

// Battle Augur 6C: a design preview of the shipped local import flow, not a file validator.
// State buttons make the native picker's outcomes reviewable in the web gallery.
const schemes = [
  { id: "default", name: "Default", accent: "#7c8cff" },
  { id: "crimson", name: "Crimson", accent: "#d8392f" },
  { id: "gilded", name: "Gilded", accent: "#c69a44" },
  { id: "azure", name: "Azure", accent: "#29b3e6" },
  { id: "verdant", name: "Verdant", accent: "#5d9c69" },
  { id: "slate", name: "Slate · imported", accent: "#7c8cff" },
];
type Outcome = "idle" | "importing" | "scheme" | "language" | "error";
export function AppearancePreferences({ props, states = false }: { props?: ConceptProps; states?: boolean }) {
  const [scheme, setScheme] = useState<string>(props?.colorScheme ?? "default");
  const [language, setLanguage] = useState(props?.language ?? "en");
  const [mode, setMode] = useState(props?.themePreference ?? props?.themeMode ?? "system");
  const [outcome, setOutcome] = useState<Outcome>("idle");
  const busy = outcome === "importing";
  const importScheme = () => { setScheme("slate"); props?.onColorSchemeChange?.("default"); setOutcome("scheme"); };
  const importLanguage = () => { setLanguage("fr"); props?.onLanguageChange?.("fr"); setOutcome("language"); };
  const feedback = outcome !== "idle" && <div role="status" style={{ display: "flex", gap: 10, padding: 14, borderRadius: 10, border: "1px solid var(--ux-line)", background: "var(--ux-surface-2)" }}>
      {busy ? <LoaderCircle size={18} /> : outcome === "error" || outcome === "language" ? <AlertTriangle size={18} /> : <Check size={18} />}
      <div style={{ flex: 1 }}><strong>{busy ? "Importing…" : outcome === "error" ? "Import failed" : "Imported and selected"}</strong>
        <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5 }}>{outcome === "error" ? "The scheme does not meet WCAG AA contrast: light: ink on surface (1.00 < 4.5)." : outcome === "language" ? "5 missing strings use English. 2 unknown keys were ignored. The language is saved on this device." : busy ? "Reading and validating the selected JSON file." : "The colour scheme is saved on this device. Choose another scheme at any time."}</p>
      </div>
      {!busy && <button type="button" className="ux-icon-btn" aria-label="Dismiss import notice" onClick={() => setOutcome("idle")}><X size={16} /></button>}
    </div>;
  return <div className="ux-appearance-preferences" style={{ display: "grid", gap: 12 }}>
    <div className="ux-result-label">Appearance</div>
    <div style={{ background: "var(--ux-surface)", borderRadius: 14, padding: 14 }}>
      <strong>Theme</strong><div role="radiogroup" aria-label="Theme" style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {(["system", "light", "dark"] as const).map(value => <button key={value} type="button" className="ux-appearance-action" role="radio" aria-checked={mode === value} style={{ flex: 1, minHeight: 44 }} onClick={() => { setMode(value); props?.onThemePreferenceChange?.(value); }}>{value[0].toUpperCase() + value.slice(1)}{mode === value && <Check size={14} />}</button>)}
      </div>
    </div>
    <div className="ux-result-label"><Palette size={14} />Colour scheme</div>
    <div role="radiogroup" aria-label="Colour scheme" style={{ background: "var(--ux-surface)", borderRadius: 14, overflow: "hidden" }}>
      {schemes.map(item => <button key={item.id} type="button" role="radio" aria-checked={scheme === item.id} className="ux-setting-row" style={{ minHeight: 52 }} onClick={() => { setScheme(item.id); props?.onColorSchemeChange?.(item.id === "slate" ? "default" : item.id as NonNullable<ConceptProps["colorScheme"]>); }}>
        <span aria-hidden style={{ display: "flex", width: 46, height: 28, overflow: "hidden", borderRadius: 8, border: "1px solid var(--ux-line)" }}>{["var(--ux-bg)", item.accent, "var(--ux-cool)"].map((color, i) => <span key={i} style={{ flex: 1, background: color }} />)}</span>
        <span style={{ flex: 1, textAlign: "left" }}>{item.name}</span>{scheme === item.id && <Check size={18} />}
      </button>)}
      <div style={{ padding: 14 }}><button type="button" className="ux-appearance-action" disabled={busy} onClick={importScheme}><Upload size={16} />Import colour scheme</button>{outcome !== "language" && feedback && <div style={{ marginTop: 10 }}>{feedback}</div>}</div>
    </div>
    <div className="ux-result-label"><Languages size={14} />Language</div>
    <div role="radiogroup" aria-label="Language" style={{ background: "var(--ux-surface)", borderRadius: 14 }}>
      {([['en', 'English'], ['fr', 'Français · imported']] as const).map(([locale, name]) => <button key={locale} type="button" role="radio" aria-checked={language === locale} className="ux-setting-row" onClick={() => { setLanguage(locale); props?.onLanguageChange?.(locale); }}><Languages size={18} /><span style={{ flex: 1, textAlign: "left" }}>{name}</span>{language === locale && <Check size={18} />}</button>)}
      <div style={{ padding: 14 }}><button type="button" className="ux-appearance-action" disabled={busy} onClick={importLanguage}><Upload size={16} />Upload language pack</button>{outcome === "language" && <div style={{ marginTop: 10 }}>{feedback}</div>}</div>
    </div>
    <p className="ux-hint">Only the app interface is translated. Game data is shown as written.{language === "fr" && " 5 untranslated strings use English."}</p>
    {states && <details><summary>Import states · gallery controls</summary><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
      <button type="button" className="ux-appearance-action" onClick={() => setOutcome("importing")}>Importing</button>
      <button type="button" className="ux-appearance-action" onClick={importScheme}>Saved scheme</button>
      <button type="button" className="ux-appearance-action" onClick={importLanguage}>Language warnings</button>
      <button type="button" className="ux-appearance-action" onClick={() => setOutcome("error")}>Contrast error</button>
      <button type="button" className="ux-appearance-action" onClick={() => setOutcome("idle")}>Cancel / unchanged</button>
    </div><p className="ux-hint">Native app: system JSON picker; 16 KiB schemes, 128 KiB language packs, eight of each. Reimport the same ID or locale to replace. Errors preserve the current choice.</p></details>}
  </div>;
}
