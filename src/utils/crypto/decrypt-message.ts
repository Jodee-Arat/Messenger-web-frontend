import { toast } from "sonner";

import { MessageType } from "@/components/features/chat/types/message.type";

import { FindAllMessagesByChatQuery } from "@/graphql/generated/output";

import { decryptTextDes } from "./des/decrypt-des";
import { decryptHashRsa } from "./rsa/decrypt-hash-rsa";
import { sha1Hash } from "./sha-1/sha-1-hash";

export async function decryptMessage(
  message: FindAllMessagesByChatQuery["findAllMessagesByChat"][number],
  sessionKey: string,
  keyE: bigint,
  keyN: bigint
): Promise<MessageType | null> {
  const { hash, ...rest } = message;

  console.log("Encrypted message from server:", message.text);
  console.log("Encrypted hash from server:", hash);

  const decryptText = decryptTextDes(sessionKey, message.text!);

  if (!decryptText) return null;

  const decryptTextHash = await sha1Hash(decryptText);
  const decryptHash = decryptHashRsa(hash, keyE, keyN);

  if (decryptTextHash !== decryptHash) {
    toast.error("invalid hash from server");
    return null;
  }
  return {
    ...rest,
    text: decryptText,
  };
}
