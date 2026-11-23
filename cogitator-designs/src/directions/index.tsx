import type { DirectionId } from "./meta";
import { DirectionA } from "./DirectionA";
import { DirectionB } from "./DirectionB";
import { DirectionC } from "./DirectionC";
import { DirectionD, type DState } from "./DirectionD";

/** One direction's window. Only D is interactive; `interactive={false}` draws it as a still preview (the mood board). */
export function DirectionScreen({ id, mode, state, interactive = true }: { id: DirectionId; mode: "light" | "dark"; state?: DState; interactive?: boolean }) {
  if (id === "a") return <DirectionA mode={mode} />;
  if (id === "b") return <DirectionB mode={mode} />;
  if (id === "d") return <DirectionD mode={mode} initial={state} interactive={interactive} />;
  return <DirectionC mode={mode} />;
}
