import { MessageFileType } from "@/shared/types/message-file.type";
import { cn } from "@/shared/utils/tw-merge";
import { FC } from "react";
import { useTranslations } from "next-intl";

import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import MessageFileList from "./file/MessageFileList";

interface MessageFormProp {
  chatId: string;
  userId: string;
  user: {
    id: string;
    avatarUrl?: string | null;
    username: string;
  };
  isEdited?: boolean;
  text?: string | null;
  files?: MessageFileType[] | null | undefined;
  isSelected: boolean;
  createdAt?: string | Date | null | undefined;
  showSenderName?: boolean;
}

const formatTime = (date?: string | Date | null | undefined) => {
  if (!date) return "";

  try {
    const parsedDate =
      typeof date === "string" && /^\d+$/.test(date)
        ? parseInt(date, 10)
        : date;

    return new Intl.DateTimeFormat("ru-RU", {
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(parsedDate as any));
  } catch {
    return "";
  }
};

const MessageForm: FC<MessageFormProp> = ({
  chatId,
  user,
  userId,
  files,
  isSelected,
  text,
  isEdited,
  createdAt,
  showSenderName = true,
}) => {
  const t = useTranslations("messages");
  const isOwnMessage = user.id === userId;
  const bubbleClass = isOwnMessage
    ? "rounded-[22px] rounded-br-md bg-primary px-3 py-2 text-primary-foreground"
    : "rounded-[22px] rounded-bl-md border border-border/60 bg-card/85 px-3 py-2 text-foreground shadow-sm";
  const timeToneClass = isOwnMessage
    ? "text-primary-foreground/70"
    : "text-muted-foreground/70";

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-end gap-2",
          isOwnMessage ? "flex-row-reverse" : "flex-row",
        )}
      >
        {!isOwnMessage && (
          <div className="mb-0.5 shrink-0">
            <EntityAvatar
              name={user.username}
              avatarUrl={user.avatarUrl}
              size="sm"
            />
          </div>
        )}

        <div
          className={cn("min-w-0", isOwnMessage ? "items-end" : "items-start")}
        >
          <div
            className={cn(
              "min-w-0 max-w-[min(100%,42rem)] overflow-hidden",
              bubbleClass,
            )}
          >
            {showSenderName && !isOwnMessage && (
              <p className="mb-1.5 text-xs font-semibold leading-none text-primary">
                {user.username}
              </p>
            )}
            {text && text !== "null" && (
              <p
                className={cn(
                  "whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]",
                  !showSenderName && !isOwnMessage && "mt-0.5",
                )}
              >
                {text}
              </p>
            )}
            <MessageFileList
              isSelected={isSelected}
              files={files ?? []}
              chatId={chatId}
              isOwnMessage={isOwnMessage}
            />
            {(isEdited || createdAt) && (
              <div
                className={cn(
                  "mt-1.5 flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1 text-[10px]",
                  timeToneClass,
                )}
              >
                {isEdited && (
                  <>
                    <span className="font-medium">{t("edited")}</span>
                    {createdAt && <span className="opacity-60">·</span>}
                  </>
                )}
                {createdAt && <span>{formatTime(createdAt)}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageForm;
