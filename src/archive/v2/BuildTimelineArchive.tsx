import { BuildTimeline } from "../../concepts/v2/BuildTimeline";

export function BuildTimelineArchive(props: Parameters<typeof BuildTimeline>[0]) {
  return <BuildTimeline {...props} />;
}
