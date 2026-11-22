import { MacWindow } from "../frames";

export function DirectionC({ mode }: { mode: "light" | "dark" }) {
  return <MacWindow mode={mode}><div style={{ padding: 40 }}>Direction C</div></MacWindow>;
}
