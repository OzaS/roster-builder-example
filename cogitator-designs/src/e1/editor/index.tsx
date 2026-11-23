import type { E1Screen } from "../types";
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
];
