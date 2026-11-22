import { MacWindow } from "../frames";

export function DirectionB({ mode }: { mode: "light" | "dark" }) {
  return <MacWindow mode={mode}><div style={{ padding: 40 }}>Direction B</div></MacWindow>;
}
