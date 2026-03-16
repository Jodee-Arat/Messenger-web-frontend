import {
  usePinMessageMutation,
  useRemoveMessagesMutation,
} from "@/shared/graphql/generated/output";
import { ForwardedMessageType } from "@/shared/types/forward/forwarded-message.type";
import { MessageType } from "@/shared/types/message.type";
import { copyToClipboard } from "@/shared/utils/copy-to-clipboard";
import { FC, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/common/ContextMenu";

import ChatMessageItem from "./ChatMessageItem";

interface ChatMessageDropdownProp {
  messageInfo: MessageType;
  setPinnedMessage: (message: MessageType | null) => void;
  userId: string;
  chatId: string;
  messageId: string;
  messageIds: string[];
  handleAddForwardedMessage: (messages: MessageType[]) => void;
  handleChooseMessage: (messageId: string) => void;
  handleClearMessagesId: () => void;
  startEdit: (
    message: MessageType,
    forwardedMessages?: ForwardedMessageType[],
  ) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
}

const ChatMessageDropdownTrigger: FC<ChatMessageDropdownProp> = ({
  chatId,
  setPinnedMessage,
  startEdit,
  handleAddForwardedMessage,
  handleClearMessagesId,
  handleChooseMessage,
  messageId,
  messageIds,
  messageInfo,
  userId,
  canEdit = true,
  canDelete = true,
  canPin = true,
}) => {
  const t = useTranslations("messages");

  const [removeMessage] = useRemoveMessagesMutation({
    onCompleted() {
      toast.success(t("messagesDeletedSuccess"));
    },
    onError(err) {
      toast.error(t("failedDeleteMessages") + ": " + err.message);
    },
  });

  const [pinMessage] = usePinMessageMutation({
    onCompleted() {
      setPinnedMessage(messageInfo);
      toast.success(t("messagePinned"));
    },
    onError(err) {
      toast.error(t("pinError") + ": " + err.message);
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
          {t("select")}
        </ContextMenuItem>
        <ContextMenuItem
          className="cursor-pointer"
          onClick={() => handleAddMessage()}
        >
          {t("reply")}
        </ContextMenuItem>
        <ContextMenuItem
          className="cursor-pointer"
          onClick={() => copyToClipboard(messageInfo.text ?? "")}
        >
          {t("copy")}
        </ContextMenuItem>
        {canEdit && (
          <ContextMenuItem
            className="cursor-pointer"
            onClick={() =>
              startEdit(
                messageInfo,
                messageInfo?.repliedToLinks
                  ?.map(link => link?.repliedTo)
                  .filter((msg): msg is ForwardedMessageType => !!msg) ?? [],
              )
            }
          >
            {t("edit")}
          </ContextMenuItem>
        )}
        {canPin && (
          <ContextMenuItem
            className="cursor-pointer"
            onClick={() => {
              pinMessage({
                variables: { chatId, messageId: messageInfo.id },
              });
            }}
          >
            {t("pin")}
          </ContextMenuItem>
        )}
        {canDelete && (
          <ContextMenuItem
            className="text-destructive cursor-pointer"
            onClick={() => handleRemoveMessage()}
          >
            {t("delete")}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ChatMessageDropdownTrigger;
