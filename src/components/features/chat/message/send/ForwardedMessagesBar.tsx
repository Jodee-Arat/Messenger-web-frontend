import { ForwardedMessageType } from "@/shared/types/forward/forwarded-message.type";
import { cn } from "@/shared/utils/tw-merge";
import { CornerUpRight, X } from "lucide-react";
import { FC } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/common/Button";

interface ForwardedMessagesBarProp {
  forwardedMessages: ForwardedMessageType[];
  setForwardedMessages: (messages: ForwardedMessageType[]) => void;
}

const ForwardedMessagesBar: FC<ForwardedMessagesBarProp> = ({
  setForwardedMessages,
  forwardedMessages,
}) => {
  const t = useTranslations("messages");
  const usernames = Array.from(
    new Set(forwardedMessages.map(message => message.user.username)),
  );
  const isMultiple = forwardedMessages.length > 1;

  return (
    <div className="mb-2 flex items-start justify-between gap-3 rounded-[24px] border border-border/60 bg-card/80 px-3 py-2 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full">
          <CornerUpRight className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {t("forward")}
          </p>
          {isMultiple ? (
            <>
              <p className="truncate text-sm font-medium text-foreground">
                {usernames.join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {forwardedMessages.length} {t("messagesCount")}
              </p>
            </>
          ) : (
            <>
              <p className="truncate text-sm font-medium text-foreground">
                {forwardedMessages[0]?.user.username}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {forwardedMessages[0]?.text?.trim() ||
                  (forwardedMessages[0]?.files?.length
                    ? `${forwardedMessages[0].files.length} ${t("files")}`
                    : t("empty"))}
              </p>
            </>
          )}
        </div>
      </div>

      <Button
        type="button"
        onClick={() => setForwardedMessages([])}
        className="size-8 shrink-0 rounded-full"
        variant="ghost"
        size="icon"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
};

export default ForwardedMessagesBar;
