import { X } from "lucide-react";
import { FC, memo } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/common/Button";

import ForwardMessageModal from "../message/list/ForwardMessageModal";

interface ChatToolbarProp {
  messageIds?: string[];
  handleRemoveMessages: () => void;
  handleClearMessagesId: () => void;
  handleAddForwarded: (messageIds: string[]) => void;
  chatId: string;
}

const ChatToolbar: FC<ChatToolbarProp> = ({
  messageIds,
  handleRemoveMessages,
  handleClearMessagesId,
  handleAddForwarded,
  chatId,
}) => {
  const t = useTranslations("messages");

  return (
    <div>
      {messageIds && messageIds.length > 0 && (
        <div className="flex items-center justify-end space-x-5 rounded-lg">
          <Button
            onClick={() => handleAddForwarded(messageIds)}
            className=""
            variant="default"
          >
            {t("reply")}
          </Button>
          <ForwardMessageModal
            handleAddForwarded={handleAddForwarded}
            chatId={chatId}
            messageIds={messageIds}
            handleClearMessagesId={handleClearMessagesId}
          />

          <Button onClick={handleRemoveMessages} className="" variant="default">
            {t("removeSelection")}
          </Button>
          <span className="text-sm">
            {t("messagesSelected") + ": " + messageIds.length}
          </span>
          <Button
            onClick={handleClearMessagesId}
            className="p-0"
            variant="ghost"
            size="icon"
            asChild
          >
            <X className="size-7.5 py-0.5 px-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default memo(ChatToolbar);
