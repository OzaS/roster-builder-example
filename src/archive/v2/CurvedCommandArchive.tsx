import { CurvedCommand } from "../../concepts/v2/CurvedCommand";

export function CurvedCommandArchive(props: Parameters<typeof CurvedCommand>[0]) {
  return <CurvedCommand {...props} />;
}
