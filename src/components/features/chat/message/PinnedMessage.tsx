import { X } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";

import { useUnPinMessageMutation } from "@/graphql/generated/output";

import { MessageType } from "@/types/message.type";

interface PinnedMessageProp {
  pinnedMessage: MessageType | null;
  setPinnedMessage: (message: MessageType | null) => void;
  chatId: string;
}

const PinnedMessage: FC<PinnedMessageProp> = ({
  pinnedMessage,
  setPinnedMessage,
  chatId,
}) => {
  const [unpinMessage, { loading: isUnpinning }] = useUnPinMessageMutation({
    onCompleted() {
      setPinnedMessage(null);
    },
    onError(err) {
      toast.error("Failed to unpin message: " + err.message);
    },
  });

  return (
    <>
      {pinnedMessage && (
        <div className="">
          <div className="flex items-center justify-between space-x-2 p-1">
            {pinnedMessage && pinnedMessage?.text ? (
              <div className="flex flex-col space-x-2">
                <h5 className="text-primary-foreground">
                  {pinnedMessage.user.username}
                </h5>
                <p className="text-muted-foreground text-xs">
                  {pinnedMessage?.text}
                </p>
              </div>
            ) : pinnedMessage &&
              pinnedMessage.files?.length &&
              pinnedMessage.files.length > 0 ? (
              <div className="flex flex-col space-x-2">
                <h5 className="text-primary-foreground">
                  {pinnedMessage.user.username}
                </h5>
                <p className="text-xs text-blue-400">
                  {pinnedMessage.files.length} файл(ов)
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">Пусто</p>
            )}
            <Button
              onClick={() => {
                unpinMessage({
                  variables: { chatId },
                });
              }}
              disabled={isUnpinning}
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default PinnedMessage;
