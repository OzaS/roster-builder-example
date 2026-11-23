import type { E1Screen } from "../types";
import { ReferencesScreen } from "./ReferencesScreen";
import { SourceScreen } from "./SourceScreen";

/** Worker B: source text beside the page, go to definition / backlinks / peek, the diagnostics inbox, in-editor empty states. */
export const editorScreens: E1Screen[] = [
  {
    id: "e1-editor-source",
    group: "Edit",
    title: "Source text beside the page",
    item: "cg-e1-editor-source",
    summary:
      "Source (⌘⌥U) splits the page area: the entry page on the left, its module's DKLPO text on the right, synced both ways (a block selects its lines, a line selects its block, a line in another entry opens that entry). The text editor has line numbers, syntax colours from the tokens, diagnostics as gutter icons and underlines (error wavy, preservation dashed, suggestion dotted), a hover card and a quick-fix menu at the caret (⌥↵), and a status line. The split needs 1000 px for the page area (page 480 + text 520): at 1440 the source list folds away while the text is open; below that (the 960 px window) Source switches between page and text. A module that doesn't parse opens as text only and its pages wait for it to parse.",
    states: [
      { id: "split", title: "Page and text, synced" },
      { id: "text-only", title: "Text only, whole module" },
      { id: "error", title: "Unknown reference, quick fix" },
      { id: "parse-error", title: "Module doesn't parse" },
      { id: "large", title: "Large text" },
      { id: "narrow", title: "960 px window" },
    ],
    tryIt: [
      { what: "Sync", how: "click a block or a property on the page: its lines light up in the text; click a line in the text: its block lights up (a line in another entry opens that entry)." },
      { what: "Diagnostics", how: "hover an underline for the card; Remove line / Move to envelope apply in place. ⌥↵ opens the quick fixes at the caret, Esc closes them." },
      { what: "Views", how: "Source (⌘⌥U) toggles the text; Text only / Page beside in the text header; × closes the text." },
      { what: "Unknown reference", how: "in the error state pick Change to iron-wardens:halberd: the underline, the gutter icon and the red mention on the page go." },
      { what: "Parse error", how: "Indent to 4 spaces (or Go to line, then ↵): the module parses and the Source button comes back." },
    ],
    render: ({ mode, state, interactive }) => <SourceScreen mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-editor-references",
    group: "References",
    title: "Go to definition, peek and backlinks",
    item: "cg-e1-editor-references",
    summary:
      "Following a reference from the page or the text. Go to definition (F12, ⌘-click, or a click on a mention) opens the target entry; Back and Forward (⌘[ / ⌘]) sit at the start of the page toolbar and name where they go; the breadcrumbs follow. Peek (⌥F12, ⌥-click) opens the target under the line that refers to it, as an inline frame with an accent edge (an embedded view, not a raised card): its page or its text, editable in place, with its path, source and layer, Open (F12) and Close (Esc). Backlinks (⇧F12, or the page's backlinks line) are a fourth tab of D's helper panel, grouped by source and layer, each with its line; ↑ ↓ move, ↵ opens. A panel tab because the list is worked through one place after another and has to stay while you go: a peek belongs to one line of the page and a popover closes on the first navigation, while D's panel already holds the issue lists. A reference that resolves to nothing says so at the reference and offers the fix instead of navigating.",
    states: [
      { id: "definition", title: "After Go to definition: Back enabled" },
      { id: "peek", title: "Peek of Spear under the group line" },
      { id: "backlinks", title: "Warden Squad's 3 backlinks" },
      { id: "unresolved", title: "Reference that resolves to nothing" },
    ],
    tryIt: [
      { what: "Go to definition", how: "click a mention (Spear, Halberd, Shield Wall, Warden Captain) or focus it and press F12; Back / Forward or ⌘[ / ⌘] walk the history." },
      { what: "Peek", how: "⌥-click a mention or ⌥F12 on it; switch Page / Text in the peek; Open (F12) goes there, Esc or × closes." },
      { what: "Backlinks", how: "on Warden Squad press ⇧F12 or click “3 backlinks”; ↑ ↓ move, ↵ or Open goes there (the captain's page, or the text at the line)." },
      { what: "Unresolved", how: "click the red halbred mention on Ice Guard: no navigation, the fix is offered; Change to halberd resolves it." },
    ],
    render: ({ mode, state, interactive }) => <ReferencesScreen mode={mode} state={state} interactive={interactive} />,
  },
];
