import { FindAllMessagesByChatQuery } from "@/graphql/generated/output";

export type MessageType = Omit<
  FindAllMessagesByChatQuery["findAllMessagesByChat"][number],
  "hash"
>;
