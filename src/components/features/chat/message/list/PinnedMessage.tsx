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
  canPin?: boolean;
}

const PinnedMessage: FC<PinnedMessageProp> = ({
  pinnedMessage,
  setPinnedMessage,
  chatId,
  canPin = true,
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
        <div className="mx-auto mb-2 w-full max-w-4xl rounded-[22px] border border-border/60 bg-card/70 px-3 py-2 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            {pinnedMessage && pinnedMessage?.text ? (
              <div className="min-w-0">
                <h5 className="truncate text-sm font-semibold">
                  {pinnedMessage.user.username}
                </h5>
                <p className="truncate text-xs text-muted-foreground">
                  {pinnedMessage?.text}
                </p>
              </div>
            ) : pinnedMessage &&
              pinnedMessage.files?.length &&
              pinnedMessage.files.length > 0 ? (
              <div className="min-w-0">
                <h5 className="truncate text-sm font-semibold">
                  {pinnedMessage.user.username}
                </h5>
                <p className="text-xs text-blue-400">
                  {pinnedMessage.files.length} {t("files")}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">{t("empty")}</p>
            )}
            {canPin && (
              <Button
                onClick={() => {
                  unpinMessage({
                    variables: { chatId },
                  });
                }}
                disabled={isUnpinning}
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PinnedMessage;
