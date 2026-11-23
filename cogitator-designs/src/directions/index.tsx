import type { DirectionId } from "./meta";
import { DirectionD, type DState } from "./DirectionD";

/** Direction D's window (the chosen entry editor). `interactive={false}` draws it as a still preview. */
export function DirectionScreen({ id: _id, mode, state, interactive = true }: { id: DirectionId; mode: "light" | "dark"; state?: DState; interactive?: boolean }) {
  return <DirectionD mode={mode} initial={state} interactive={interactive} />;
}
