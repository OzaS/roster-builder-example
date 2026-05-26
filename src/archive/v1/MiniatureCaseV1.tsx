import { MiniatureCase } from "../../concepts/MiniatureCase";

export function MiniatureCaseV1(props: Parameters<typeof MiniatureCase>[0]) {
  return <MiniatureCase {...props} />;
}
