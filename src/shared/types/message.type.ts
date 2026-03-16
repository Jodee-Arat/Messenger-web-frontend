import { FindAllMessagesByChatQuery } from "@/shared/graphql/generated/output";

export type MessageType =
  FindAllMessagesByChatQuery["findAllMessagesByChat"][number];
