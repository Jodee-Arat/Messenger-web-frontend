import {
  Pencil,
  Pin,
  PinOff,
  Reply,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { FC, memo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import {
  usePinMessageMutation,
  useUnPinMessageMutation,
} from "@/shared/graphql/generated/output";
import { ForwardedMessageType } from "@/shared/types/forward/forwarded-message.type";
import { MessageType } from "@/shared/types/message.type";

import ForwardMessageModal from "../message/list/ForwardMessageModal";

interface ChatToolbarProp {
  messageIds?: string[];
  selectedMessage?: MessageType | null;
  handleRemoveMessages: () => void;
  handleClearMessagesId: () => void;
  handleAddForwarded: (messageIds: string[]) => void;
  chatId: string;
  canSend: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
  userId: string;
  pinnedMessageId?: string | null;
  setPinnedMessage: (message: MessageType | null) => void;
  startEdit: (
    message: MessageType,
    forwardedMessages?: ForwardedMessageType[],
  ) => void;
}

const ChatToolbar: FC<ChatToolbarProp> = ({
  messageIds,
  selectedMessage,
  handleRemoveMessages,
  handleClearMessagesId,
  handleAddForwarded,
  chatId,
  canSend,
  canEdit = true,
  canDelete = true,
  canPin = true,
  userId,
  pinnedMessageId,
  setPinnedMessage,
  startEdit,
}) => {
  const t = useTranslations("messages");
  const canEditSelectedMessage =
    !!selectedMessage &&
    canEdit &&
    selectedMessage.user.id === userId;
  const canPinSelectedMessage = !!selectedMessage && canPin;
  const isPinnedSelectedMessage = selectedMessage?.id === pinnedMessageId;
  const canForward = canSend && !!messageIds && messageIds.length > 0;

  const [pinMessage] = usePinMessageMutation({
    onCompleted() {
      if (!selectedMessage) return;

      setPinnedMessage(selectedMessage);
      handleClearMessagesId();
      toast.success(t("messagePinned"));
    },
    onError(error) {
      toast.error(`${t("pinError")}: ${error.message}`);
    },
  });

  const [unPinMessage] = useUnPinMessageMutation({
    onCompleted() {
      setPinnedMessage(null);
      handleClearMessagesId();
    },
    onError(error) {
      toast.error(`${t("unpinError")}: ${error.message}`);
    },
  });

  const handleEditMessage = () => {
    if (!selectedMessage) return;

    const forwardedMessages =
      selectedMessage.repliedToLinks
        ?.map(link => link?.repliedTo)
        .filter((msg): msg is ForwardedMessageType => !!msg) ?? [];

    startEdit(selectedMessage, forwardedMessages);
    handleClearMessagesId();
  };

  const handleTogglePin = () => {
    if (!selectedMessage) return;

    if (isPinnedSelectedMessage) {
      unPinMessage({
        variables: { chatId },
      });
      return;
    }

    pinMessage({
      variables: {
        chatId,
        messageId: selectedMessage.id,
      },
    });
  };

  if (!messageIds || messageIds.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto mb-2 flex w-full max-w-4xl items-center justify-between gap-3 rounded-[22px] border border-border/60 bg-card/75 px-3 py-2 shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          onClick={handleClearMessagesId}
          className="rounded-full"
          variant="ghost"
          size="icon"
          title={t("removeSelection")}
        >
          <X className="size-5" />
        </Button>
        <span className="truncate text-sm font-medium text-foreground">
          {messageIds.length} {t("messagesSelected")}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {canEditSelectedMessage && (
          <Button
            onClick={handleEditMessage}
            className="rounded-full"
            variant="ghost"
            size="icon"
            title={t("edit")}
          >
            <Pencil className="size-4" />
          </Button>
        )}

        {canPinSelectedMessage && (
          <Button
            onClick={handleTogglePin}
            className="rounded-full"
            variant="ghost"
            size="icon"
            title={isPinnedSelectedMessage ? t("unpin") : t("pin")}
          >
            {isPinnedSelectedMessage ? (
              <PinOff className="size-4" />
            ) : (
              <Pin className="size-4" />
            )}
          </Button>
        )}

        {canForward && (
          <Button
            onClick={() => handleAddForwarded(messageIds)}
            className="rounded-full"
            variant="ghost"
            size="icon"
            title={t("reply")}
          >
            <Reply className="size-4" />
          </Button>
        )}

        {canForward && (
          <ForwardMessageModal
            handleAddForwarded={handleAddForwarded}
            chatId={chatId}
            messageIds={messageIds}
            handleClearMessagesId={handleClearMessagesId}
            trigger={
              <Button
                className="rounded-full"
                variant="ghost"
                size="icon"
                title={t("forward")}
              >
                <Share2 className="size-4" />
              </Button>
            }
          />
        )}

        {canDelete && (
          <Button
            onClick={handleRemoveMessages}
            className="rounded-full"
            variant="ghost"
            size="icon"
            title={t("delete")}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default memo(ChatToolbar);
