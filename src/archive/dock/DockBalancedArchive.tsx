import { DockBalanced } from "../../concepts/dock/DockBalanced";

export function DockBalancedArchive(props: Parameters<typeof DockBalanced>[0]) {
  return <DockBalanced {...props} />;
}
