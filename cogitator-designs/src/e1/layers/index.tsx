import type { E1Screen } from "../types";
import { LayerStackScreen } from "./LayerStackScreen";

/** E1 screens part 2, worker B: the layer stack with its page overlay, dataset search, the dataset runner. */
export const layerScreens: E1Screen[] = [
  {
    id: "e1-layers-stack",
    group: "Layers",
    title: "Layer stack and page overlay",
    item: "cg-e1-layers-stack",
    summary:
      "The sidebar's Layers opens the dataset's layer stack as a full view in place of the list and the page (as Updates opens the inbox). Left: the base, then its add-ons and variants in the order they apply (later wins), each with its kind and purpose, its key and version, the `requires:` result and what it does (patches applied, new modules, text keys) or why it is refused; a switch turns a layer on or off, and a test variant is marked Test. The order is Derived (from requires: and each patch's after, ties by key) or Explicit (like --layers: drag a row or ⌥↑ ⌥↓; an order that breaks an after is a layer-order error and nothing applies). Right: the selected layer's manifest facts, its patch report (each operation with its outcome and line), the values it changes (base value → value), the conflict when a later layer sets the same value (the value through the stack, the later one wins), and for an add-on the display-only check (logic hash with and without it; text that reaches logic is addon-changes-rules: declare it a variant). Show on page opens the entry with the layer overlay: changed values get an accent edge, the base value struck and the layer as a chip that explains the change; Effective / Base only switches the values; Layer changes (⌘⌥L) turns the overlay off.",
    states: [
      { id: "stack", title: "Stack OK, House rules selected" },
      { id: "refused", title: "A layer refused: requires mismatch" },
      { id: "conflict", title: "Draft points on: patch conflict" },
      { id: "addon-rules", title: "Add-on that changes rules" },
      { id: "overlay", title: "Entry page with the layer overlay" },
    ],
    tryIt: [
      { what: "Select", how: "click a layer or move with ↑ ↓; the detail follows." },
      { what: "On / off", how: "the switch (or Space on a row); turning Draft points on shows the conflict with House rules, off brings 18 back." },
      { what: "Order", how: "Explicit, then drag a row or ⌥↑ ⌥↓; put Draft points above House rules to see the layer-order error; Use the derived order fixes it." },
      { what: "Overlay", how: "Show on page beside a Warden Squad value; on the page click the House rules chip for how it changed; Effective / Base only; Back or the sidebar's Layers return." },
    ],
    render: ({ mode, state, interactive }) => <LayerStackScreen mode={mode} state={state} interactive={interactive} />,
  },
];
