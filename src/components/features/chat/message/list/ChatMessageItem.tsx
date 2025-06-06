import Image from "next/image";
import { FC } from "react";

import { cn } from "@/utils/tw-merge";

import { MessageType } from "../../types/message.type";

import MessageFileList from "./file/MessageFileList";

interface ChatMessageItemProp {
  messageInfo: MessageType;
  userId: string;
  sessionKey: bigint;
  keyE: bigint;
  keyN: bigint;
  messageId: string;
  messageIds: string[];
  handleChooseMessage: (messageId: string) => void;
}

const ChatMessageItem: FC<ChatMessageItemProp> = ({
  messageInfo,
  handleChooseMessage,
  messageId,
  userId,
  keyE,
  keyN,
  messageIds,
  sessionKey,
}) => {
  const { text, user, files } = messageInfo;

  return (
    <button
      onClick={() => handleChooseMessage(messageId)}
      className={cn(
        "hover:bg-accent/50 outline-hidden m-0 flex cursor-pointer rounded-lg p-2",
        messageIds.includes(messageId)
          ? "bg-linear-to-b bg-accent hover:bg-accent"
          : "bg-transparent",
        user.id === userId ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex w-[80%] flex-row-reverse items-start gap-3",
          user.id === userId ? "flex-row-reverse" : "flex-row"
        )}
      >
        <Image
          src={"/images/avatar/avatar.png"}
          alt={user.username}
          width={40}
          height={40}
          className="size-8 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className={cn(user.id === userId ? "text-end" : "text-start")}>
            {user.username}
          </h3>
          {text && text !== "null" && (
            <p className="break-all text-start text-sm">{text}</p>
          )}
          <MessageFileList
            files={files!}
            keyE={keyE}
            keyN={keyN}
            sessionKey={sessionKey}
          />
        </div>
      </div>
    </button>
  );
};

export default ChatMessageItem;
