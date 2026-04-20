import { ForwardedMessageType } from "@/shared/types/forward/forwarded-message.type";
import { MessageType } from "@/shared/types/message.type";
import { cn } from "@/shared/utils/tw-merge";
import { FC } from "react";

import MessageForm from "./MessageForm";
import ForwardMessageList from "./forward/ForwardMessageList";

interface ChatMessageItemProp {
  messageInfo: MessageType;
  userId: string;
  chatId: string;
  messageId: string;
  messageIds: string[];
  handleChooseMessage: (messageId: string) => void;
  showSenderName?: boolean;
}

const ChatMessageItem: FC<ChatMessageItemProp> = ({
  messageInfo,
  handleChooseMessage,
  messageId,
  userId,
  messageIds,
  chatId,
  showSenderName = true,
}) => {
  const { text, user, files, isEdited } = messageInfo;
  const isSelected = messageIds.includes(messageId);
  const isOwnMessage = user.id === userId;

  const forwardedMessages: ForwardedMessageType[] = (
    messageInfo.repliedToLinks ?? []
  )
    .filter(
      (link): link is NonNullable<typeof link> => !!link && !!link.repliedTo,
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
        avatarUrl: link.repliedTo!.user.avatarUrl ?? null,
      },
    }));

  return (
    <div
      onClick={() => handleChooseMessage(messageId)}
      className={cn(
        "group relative flex w-full cursor-pointer items-end rounded-2xl px-2 py-1.5 transition-colors",
        isSelected
          ? "bg-primary/15 hover:bg-primary/20"
          : "hover:bg-primary/10",
        isOwnMessage ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 max-w-[82%] flex-col gap-2",
          isOwnMessage ? "items-end text-right" : "items-start text-left",
        )}
      >
        <MessageForm
          chatId={chatId}
          isSelected={isSelected}
          user={user}
          userId={userId}
          files={files}
          text={text}
          isEdited={isEdited}
          createdAt={messageInfo.createdAt}
          showSenderName={showSenderName}
        />

        {messageInfo.repliedToLinks &&
          messageInfo.repliedToLinks.length > 0 && (
            <div
              className={cn(
                "space-y-3 rounded-[20px] border border-border/60 bg-card/55 p-3 shadow-sm",
                isOwnMessage ? "mr-6" : "ml-6",
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
