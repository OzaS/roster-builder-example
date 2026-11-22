import type { DirectionId } from "./meta";
import { DirectionA } from "./DirectionA";
import { DirectionB } from "./DirectionB";
import { DirectionC } from "./DirectionC";

export function DirectionScreen({ id, mode }: { id: DirectionId; mode: "light" | "dark" }) {
  if (id === "a") return <DirectionA mode={mode} />;
  if (id === "b") return <DirectionB mode={mode} />;
  return <DirectionC mode={mode} />;
}
