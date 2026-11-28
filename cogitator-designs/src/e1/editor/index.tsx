import type { E1Screen } from "../types";
import { DiagnosticsScreen } from "./DiagnosticsScreen";
import { EmptyScreen } from "./EmptyScreen";
import { CellsScreen } from "./CellsScreen";
import { EntryPageScreen } from "./EntryPageScreen";
import { HelperNoFixScreen } from "./HelperNoFixScreen";
import { PageEditScreen } from "./PageEditScreen";
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
      { id: "no-fix", title: "As built: quick fix menu, no fixes yet" },
      { id: "no-fix-card", title: "As built: hover card, fix buttons disabled" },
      { id: "parse-error-no-fix", title: "As built: module doesn't parse, no fixes yet" },
      { id: "text-alone", title: "As built: 960 px, the text alone" },
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
  {
    id: "e1-editor-diagnostics",
    group: "Diagnostics",
    title: "Diagnostics inbox",
    item: "cg-e1-editor-diagnostics",
    summary:
      "The dataset's diagnostics as a full view, reached from the sidebar's Updates (⌘⇧U). It takes the place of the list and the page; D's helper box and panel stay the quick view beside a page (this page, or Dataset scope), and their “Open all” leads here, so the two show the same list at two sizes. Grouped by kind (errors, preservation failures, authoring suggestions) with status edges; filters by source, layer and code plus a text filter; ↑ ↓ move, ↵ opens the entry with the issue in its helper, ⌥↵ applies the fix; the detail pane shows the affected text or, for a preservation failure, the export difference, and offers “Apply to all n of this kind” for a suggestion code. When the dataset changed since the last check the list says it is out of date and offers Run checks (⌘⇧C); with no issues it says when it checked and what. As built in E1-5 (approved 2026-11-25, A7): a class row of the check run opens the inbox filtered by that class, shown as a Class chip that clears it (the inbox draws no class filter otherwise); Run checks runs.",
    states: [
      { id: "inbox", title: "Inbox, an error selected" },
      { id: "preservation", title: "Preservation failure with its diff" },
      { id: "stale", title: "Out of date: edits since the check" },
      { id: "clear", title: "No issues" },
      { id: "no-fixes", title: "As built: Built 14:06, fix buttons disabled" },
      { id: "no-fixes-preservation", title: "As built: preservation failure, no diff yet" },
      { id: "stale-build", title: "As built: newest build failed, edits since" },
      { id: "stale-no-build", title: "As built: doesn't build" },
      { id: "class-filter", title: "As built: opened from a check class (Class chip)" },
    ],
    tryIt: [
      { what: "Triage", how: "↑ ↓ (or j k) move through the list, ↵ opens the entry, ⌥↵ applies the selected fix; Undo brings it back." },
      { what: "Bulk", how: "select a default-value suggestion and Apply to all 3 of this kind." },
      { what: "Filters", how: "Source, Layer and Code open a menu; × clears one; type in the filter field." },
      { what: "Checks", how: "Run checks (⌘⇧C) shows progress, then the out-of-date note goes." },
    ],
    render: ({ mode, state, interactive }) => <DiagnosticsScreen mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-editor-page-edits",
    group: "Edit",
    title: "Editing on the page",
    item: "cg-e1-editor-page-edits",
    summary:
      "Editing an entry on its page (E1-3 as built, approved by the user 2026-11-24). A value cell edits in place: click it, or ↵ on a focused row; the value becomes a field in the same type and size with the accent ring and “↵ saves”; ↵ saves, Esc or clicking away cancels; each tag or cost edits its own statement. The title edits the same way in the h1's own type. A refusal stands beside the field in error red. A selected statement is drawn as the text view's linked block (the selection tint); the keyboard focus goes with it and draws no ring over the tint. With a statement selected, / opens the insert menu right after it, inserting into its block (“Valid in” names that block); the list scrolls past 340 px. After inserting, the new statement is selected; with the text open, the text has the focus with the placeholder key selected, ready to type over. A right-click (⇧F10) opens the statement's context menu: Insert below…, Move up, Move down, then Remove statement in error red, keys as muted text; an item that can't run is disabled and says why. A refused remove, move or insert shows in the top bar, in place of “Edited just now”, for 6 s. While files are unsaved, the sidebar footer reads “Unsaved · n files” with the warning dot.",
    states: [
      { id: "edit-value", title: "Editing a value (Cost)" },
      { id: "edit-title", title: "Editing the title" },
      { id: "field-refusal", title: "A value refused beside the field" },
      { id: "selected", title: "A selected statement" },
      { id: "slash-after", title: "/ menu after the selected statement" },
      { id: "inserted", title: "After inserting, text open, unsaved" },
      { id: "context-menu", title: "Statement context menu" },
      { id: "top-refusal", title: "A move refused in the top bar" },
    ],
    render: ({ mode, state, interactive }) => <PageEditScreen mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-editor-helper-no-fixes",
    group: "Diagnostics",
    title: "Helper before there are fixes",
    item: "cg-e1-editor-helper-no-fixes",
    summary:
      "D's helper while diagnostics carry no fixes (E1 as built, approved by the user 2026-11-24: “make them disabled if they do nothing”). The floating box's rows carry no fix buttons. In the panel the selected row shows Quick fix, or Show diff for a preservation failure, drawn disabled (the design language's disabled button: muted text on the hover fill, never a live blue primary), the reason in its tooltip. D's own box and panel keep their live buttons for when fixes arrive. As built in E1-4 (approved 2026-11-24): the panel opens at 412 px with a fourth tab, Backlinks; where the page would keep less than 480 px beside the sidebar, the list and the panel, the source list folds away.",
    states: [
      { id: "box", title: "Floating box: no fix buttons" },
      { id: "panel-issues", title: "Panel: Show diff disabled" },
      { id: "panel-suggestions", title: "Panel: Quick fix disabled" },
      { id: "panel-412", title: "As built: panel at 412 px, the list folded" },
    ],
    render: ({ mode, state, interactive }) => <HelperNoFixScreen mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-editor-empty",
    group: "Edit",
    title: "Editor empty states",
    item: "cg-e1-editor-empty",
    summary:
      "What the editor shows when there is nothing yet. A source with no entries (a new, invented catalogue, Ember Guard): the list says so and New entry (⌘N) opens an inline row with the kind and the key, validated as you type (lower case, digits, hyphens), ↵ creates, Esc cancels; the page area shows the module text so far instead of a blank. An entry with no statements: its page has the `/` hint as the first block, with the usual first statements named, a name to add in the text pack and no backlinks yet. A search with no result: the palette (⌘K) says what it searched (and what it skipped: a layer that is off) and offers to create the entry, search with that layer on, or clear.",
    states: [
      { id: "no-entries", title: "Source with no entries, New entry open" },
      { id: "no-statements", title: "Entry with no statements" },
      { id: "no-results", title: "Search with no result" },
    ],
    tryIt: [
      { what: "New entry", how: "type a key (try an upper-case letter to see the error), ↵ creates the unit and opens its empty page; ⌘N starts another." },
      { what: "First statement", how: "click the / block for the insert menu; Esc closes it." },
      { what: "Search", how: "⌘K opens the palette; type to change the query; Esc closes it." },
    ],
    render: ({ mode, state, interactive }) => <EmptyScreen mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-editor-entry-page",
    group: "Edit",
    title: "Entry page: toolbar, text pack, resizing, cells",
    item: "cg-e1-editor-entry-page",
    summary:
      "The entry page after the user's feedback of 2026-11-26 (approved Proposals FB1, FB7, FB8, FB9). FB1, the toolbar (option A): Back / Forward and the crumbs, then Run checks (the checklist icon, so the play icon means only Run) and Layer changes as icon buttons, a thin divider, Source and Run with their labels (Run the accent button: accent text, the play icon filled), and a ⋯ button whose menu lists Run checks ⌘⇧C, Layer changes ⌘⌥L, Source beside the page ⌘⌥U and Run the dataset ⌘R, then Focus mode ⌘. drawn disabled (not built yet) and “Every command and its key: ⌘K”. Keys leave the bar and appear in tooltips; Focus leaves the bar (it stays on ⌘.); “Read-only” stays only in the sidebar footer; below 1030 px of window Source and Run become their icons too. FB7, text-pack text on the page in the current language: a rule's text as a Text block under the properties (“Text”, the language, the text pack it comes from, “Click to edit”), and the text behind `$` in profile cells, names and labels shown resolved with its language; edits are saved into the pack, one undo step each; a missing text keeps the “No text” tag. FB8, drag handles on the sidebar's and the source list's right edge and on the page / text split, drawn as the helper panel's: an accent line on hover or drag, a col-resize cursor; the page keeps at least 480 px; double-click goes back to the drawn width; widths are remembered; a focused handle takes ← →. FB9 (its own later slice, after FB7): a profile table's cell edits in place, with the accent ring and the caret; Tab / ⇧Tab move between cells, ↵ saves, Esc cancels, one undo step per cell.",
    states: [
      { id: "toolbar", title: "Toolbar: icons, Source, Run, ⋯" },
      { id: "toolbar-menu", title: "Toolbar: the ⋯ menu" },
      { id: "toolbar-tip", title: "Toolbar: the key in a tooltip" },
      { id: "rule-text", title: "A rule's text from the text pack" },
      { id: "label-text", title: "The text behind $ resolved" },
      { id: "resize-list", title: "Resizing the source list" },
      { id: "resize-split", title: "The page / text split's handle" },
      { id: "cell-edit", title: "A profile cell edited in place" },
    ],
    tryIt: [
      { what: "Toolbar", how: "hover or focus a toolbar button for its tooltip and key; ⋯ opens the menu, Esc closes it; Layer changes toggles." },
      { what: "Resize", how: "drag the line at the sidebar's or the list's right edge (the page keeps 480 px); ← → on a focused handle; double-click goes back to the drawn width." },
    ],
    render: ({ mode, state, interactive }) => <EntryPageScreen mode={mode} state={state} interactive={interactive} />,
  },
  {
    id: "e1-editor-cells",
    group: "Edit",
    title: "Profile cells like a spreadsheet",
    item: "cg-fb9-round2",
    summary:
      "FB9 round 2, approved by the user on 2026-11-27. A value cell is either selected (the accent outline) or being edited (the ring and the caret). Selected: the arrows move the selection (← → along the row, ↑ ↓ to the same column of the previous or next row of that profile type), typing replaces the value, ↵ or F2 edits it, ⌫ edits it empty, Esc goes back to the page's rows. Editing: ← → move the caret, ↵ saves and selects the same column in the next row (⇧↵ up), Tab / ⇧Tab save and edit the next / previous cell (at a row's end the next row of the same type), Esc throws the text away. Leaving a cell saves it (a click on another cell edits that one; switching apps leaves the field open). The keys line follows the mode. A refused save keeps the field, nothing moves, and the reason ends with “Esc discards”. A long value wraps in its cell when shown and wraps in the cell's width while edited. The cell's context menu (right-click, ⇧F10): Edit, Turn into text · en (writes $ and puts the value in the module's text pack), Turn into plain value, Copy value; after Turn into text the cell shows its text with the language tag.",
    states: [
      { id: "selected", title: "A selected cell and its keys" },
      { id: "editing", title: "Editing: the keys while editing" },
      { id: "refused", title: "A refused save: Esc discards" },
      { id: "wrap", title: "A long value wraps in its cell" },
      { id: "wrap-edit", title: "A long value wraps while edited" },
      { id: "menu", title: "The cell's context menu" },
      { id: "text", title: "After Turn into text" },
    ],
    render: ({ mode, state, interactive }) => <CellsScreen mode={mode} state={state ?? "selected"} interactive={interactive} />,
  },
  {
    id: "e1-editor-long-value-hint",
    group: "Edit",
    title: "Long-value hint",
    item: "cg-fb9-long-value-hint",
    summary:
      "Approved by the user on 2026-11-28, both A and B (asked for on 2026-11-27 with FB9-P6b): a plain cell value longer than 40 characters that isn't a number gets a hint to move it into the text pack, where words get translated. A: a quiet glyph (the translate icon on a tag tint) in the cell's top-right corner; its tooltip says “A long value: Turn into text · en moves it to the text pack (…/text/en.dkl), where it can be translated”, and a click opens the cell's menu at Turn into text. B: an authoring suggestion in the helper box (“Warden · Attack holds a long value: words to translate belong in the text pack”), flagged on the profile's block, with Turn into text · en as its fix. Both are to be built.",
    states: [
      { id: "hint-a", title: "A: a glyph in the cell" },
      { id: "hint-b", title: "B: a suggestion in the helper box" },
    ],
    render: ({ mode, state, interactive }) => <CellsScreen mode={mode} state={state ?? "hint-a"} interactive={interactive} />,
  },

];
