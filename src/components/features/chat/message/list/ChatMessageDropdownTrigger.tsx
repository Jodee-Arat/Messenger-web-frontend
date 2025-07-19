import { FC, useCallback } from "react";
import { toast } from "sonner";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/common/ContextMenu";

import { useRemoveMessagesMutation } from "@/graphql/generated/output";

import { copyToClipboard } from "@/utils/copy-to-clipboard";

import { MessageType } from "../../../../../types/message.type";

import ChatMessageItem from "./ChatMessageItem";
import { ForwardedMessageType } from "@/types/forward/forwarded-message.type";

interface ChatMessageDropdownProp {
  messageInfo: MessageType;
  userId: string;
  chatId: string;
  messageId: string;
  messageIds: string[];
  handleAddForwardedMessage: (messages: MessageType[]) => void;
  handleChooseMessage: (messageId: string) => void;
  handleClearMessagesId: () => void;
  startEdit: (
    message: MessageType,
    forwardedMessages?: ForwardedMessageType[]
  ) => void;
}

const ChatMessageDropdownTrigger: FC<ChatMessageDropdownProp> = ({
  chatId,
  startEdit,
  handleAddForwardedMessage,
  handleClearMessagesId,
  handleChooseMessage,
  messageId,
  messageIds,
  messageInfo,
  userId,
}) => {
  const [removeMessage] = useRemoveMessagesMutation({
    onCompleted() {
      toast.success("Messages deleted successfully.");
    },
    onError(err) {
      toast.error("Failed to delete messages: " + err.message);
    },
  });

  const handleRemoveMessage = useCallback(() => {
    removeMessage({
      variables: {
        chatId: chatId,
        data: {
          messageIds: [messageId],
        },
      },
    });
  }, [chatId, removeMessage]);

  const handleAddMessage = useCallback(() => {
    handleAddForwardedMessage([messageInfo]);
    handleClearMessagesId();
  }, [chatId]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <ChatMessageItem
          chatId={chatId}
          handleChooseMessage={handleChooseMessage}
          messageId={messageId}
          messageIds={messageIds}
          messageInfo={messageInfo}
          userId={userId}
        />
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          className="cursor-pointer"
          onClick={() => handleChooseMessage(messageId)}
        >
          Select
        </ContextMenuItem>
        <ContextMenuItem
          className="cursor-pointer"
          onClick={() => handleAddMessage()}
        >
          Reply
        </ContextMenuItem>
        <ContextMenuItem
          className="cursor-pointer"
          onClick={() => copyToClipboard(messageInfo.text ?? "")}
        >
          Copy
        </ContextMenuItem>
        <ContextMenuItem
          className="cursor-pointer"
          onClick={() =>
            startEdit(
              messageInfo,
              messageInfo?.repliedToLinks
                ?.map((link) => link?.repliedTo)
                .filter((msg): msg is ForwardedMessageType => !!msg) ?? []
            )
          }
        >
          Edit
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive cursor-pointer"
          onClick={() => handleRemoveMessage()}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ChatMessageDropdownTrigger;
