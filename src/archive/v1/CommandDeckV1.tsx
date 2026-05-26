import { CommandDeck } from "../../concepts/CommandDeck";

export function CommandDeckV1(props: Parameters<typeof CommandDeck>[0]) {
  return <CommandDeck {...props} />;
}
