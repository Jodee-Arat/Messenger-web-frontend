import {
  FindAllChatsByGroupQuery,
  FindAllChatsByUserQuery,
} from "@/shared/graphql/generated/output";
import { useUser } from "@/shared/hooks/useUser";
import { getChatRoute } from "@/shared/utils/chat-route";
import {
  getDirectChatDisplayAvatar,
  getDirectChatDisplayName,
} from "@/shared/utils/direct-chat";
import { cn } from "@/shared/utils/tw-merge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/common/Button";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

export type SidebarChat =
  | FindAllChatsByUserQuery["findAllChatsByUser"][0]
  | FindAllChatsByGroupQuery["findAllChatsByGroup"][0];

interface ChatsSidebarItemProps {
  chat: SidebarChat;
}

const ChatsSidebarItem = ({ chat }: ChatsSidebarItemProps) => {
  const pathname = usePathname();
  const { userId } = useUser();
  const t = useTranslations("messages");

  const currentGroupId = pathname.split("/")[2];
  const targetGroupId = chat.isGroup ? (chat.groupId ?? currentGroupId) : null;
  const chatPath = getChatRoute({
    chatId: chat.id,
    groupId: targetGroupId,
    isGroup: chat.isGroup,
  });
  const isActive =
    pathname === chatPath || pathname.startsWith(`${chatPath}/`);
  const isDirectChat = !chat.isGroup;

  const displayName = isDirectChat
    ? getDirectChatDisplayName(chat, userId)
    : chat.chatName || "Chat";
  const displayAvatar = isDirectChat
    ? getDirectChatDisplayAvatar(chat, userId)
    : chat.avatarUrl;

  const hasDraft =
    !!chat.draftMessages &&
    chat.draftMessages.length > 0 &&
    (!!chat.draftMessages[0]?.text || !!chat.draftMessages[0]?.files?.length);

  const draft = chat.draftMessages?.[0];
  const lastMessage = chat.lastMessage;
  const draftFilesCount = draft?.files?.length ?? 0;
  const lastFilesCount = lastMessage?.files?.length ?? 0;
  const draftLabel =
    draftFilesCount > 0 ? `${draftFilesCount} ${t("files")}` : t("empty");
  const lastFilesLabel =
    lastFilesCount > 0 ? `${lastFilesCount} ${t("files")}` : t("empty");

  const previewContent = hasDraft ? (
    <>
      <span className="mr-1 font-medium text-destructive">
        [{t("draft")}]
      </span>
      <span>{draft?.text || draftLabel}</span>
    </>
  ) : lastMessage?.text ? (
    <>
      <span className="mr-1 font-medium text-primary">
        {lastMessage.user.username}:
      </span>
      <span>{lastMessage.text}</span>
    </>
  ) : lastFilesCount > 0 ? (
    <>
      <span className="mr-1 font-medium text-primary">
        {lastMessage?.user.username}:
      </span>
      <span className="text-blue-400">{lastFilesLabel}</span>
    </>
  ) : (
    <span>{t("empty")}</span>
  );

  return (
    <div>
      <Button className="h-auto w-full rounded-[22px] p-0" asChild variant="ghost">
        <Link
          href={chatPath}
          className={cn(
            "flex w-full items-center justify-start gap-3 rounded-[22px] border border-transparent px-3 py-3 text-left transition-all",
            isActive
              ? "border-primary/20 bg-primary/12 shadow-sm"
              : "hover:border-border/60 hover:bg-background/35",
          )}
        >
          <EntityAvatar size="lg" name={displayName} avatarUrl={displayAvatar} />

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-[15px] font-semibold",
                isActive ? "text-primary" : "text-foreground",
              )}
            >
              {displayName}
            </p>
            <p
              className={cn(
                "mt-0.5 truncate text-xs",
                hasDraft ? "text-primary" : "text-muted-foreground",
              )}
            >
              {previewContent}
            </p>
          </div>
        </Link>
      </Button>
    </div>
  );
};

export default ChatsSidebarItem;
