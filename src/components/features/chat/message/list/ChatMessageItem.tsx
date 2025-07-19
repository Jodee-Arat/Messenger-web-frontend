import { FC } from "react";

import { cn } from "@/utils/tw-merge";

import { MessageType } from "../../../../../types/message.type";

import MessageForm from "./MessageForm";
import ForwardMessageList from "./forward/ForwardMessageList";
import { ForwardedMessageType } from "@/types/forward/forwarded-message.type";

interface ChatMessageItemProp {
  messageInfo: MessageType;
  userId: string;
  chatId: string;
  messageId: string;
  messageIds: string[];
  handleChooseMessage: (messageId: string) => void;
}

const ChatMessageItem: FC<ChatMessageItemProp> = ({
  messageInfo,
  handleChooseMessage,
  messageId,
  userId,
  messageIds,
  chatId,
}) => {
  const { text, user, files } = messageInfo;
  const isSelected = messageIds.includes(messageId);

  const forwardedMessages: ForwardedMessageType[] = (
    messageInfo.repliedToLinks ?? []
  )
    .filter(
      (link): link is NonNullable<typeof link> => !!link && !!link.repliedTo
    )
    .map((link) => ({
      id: link.repliedTo!.id,
      text: link.repliedTo!.text ?? null,
      files:
        link.repliedTo!.files?.map((f) => ({
          id: f.id,
          fileName: f.fileName,
          fileFormat: f.fileFormat,
          fileSize: f.fileSize,
        })) ?? null,
      user: {
        id: link.repliedTo!.user.id,
        username: link.repliedTo!.user.username,
      },
    }));

  return (
    <div
      onClick={() => handleChooseMessage(messageId)}
      className={cn(
        "group relative flex w-full cursor-pointer items-start rounded-lg p-2 transition-colors",
        isSelected ? "bg-accent hover:bg-accent/90" : "hover:bg-accent/50",
        user.id === userId ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 break-words",
          user.id === userId ? "items-end text-right" : "items-start text-left"
        )}
      >
        <MessageForm
          chatId={chatId}
          isSelected={isSelected}
          user={user}
          userId={userId}
          files={files}
          text={text}
        />

        {messageInfo.repliedToLinks &&
          messageInfo.repliedToLinks.length > 0 && (
            <div
              className={cn(
                "bg-muted border-muted/50 space-y-5 rounded-md border p-4",
                user.id === userId ? "mr-10" : "ml-10"
              )}
            >
              <ForwardMessageList
                chatId={chatId}
                forwardedMessagesInfo={forwardedMessages}
                isSelected={isSelected}
                userId={userId}
              />
            </div>
          )}
      </div>
    </div>
  );
};

export default ChatMessageItem;
