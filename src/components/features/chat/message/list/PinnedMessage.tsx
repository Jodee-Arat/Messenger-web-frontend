import { useUnPinMessageMutation } from "@/shared/graphql/generated/output";
import { MessageType } from "@/shared/types/message.type";
import { X } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/common/Button";

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
  const t = useTranslations("messages");

  const [unpinMessage, { loading: isUnpinning }] = useUnPinMessageMutation({
    onCompleted() {
      setPinnedMessage(null);
    },
    onError(err) {
      toast.error(t("unpinError") + ": " + err.message);
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
                  {pinnedMessage.files.length} {t("files")}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">{t("empty")}</p>
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
