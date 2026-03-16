import { FindAllChatsByUserQuery } from "@/shared/graphql/generated/output";
import { useTranslations } from "next-intl";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/common/ContextMenu";

import ChatsSidebarItem from "./ChatsSidebarItem";

interface ChatDropdownTriggerProps {
  chat: FindAllChatsByUserQuery["findAllChatsByUser"][0];
  deleteChat: (chatId: string) => void;
  canDelete?: boolean;
}

const ChatDropdownTrigger = ({
  chat,
  deleteChat,
  canDelete = true,
}: ChatDropdownTriggerProps) => {
  const t = useTranslations("chats");

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <ChatsSidebarItem chat={chat} />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[230px]">
        {canDelete && (
          <ContextMenuItem
            className="text-destructive"
            onClick={() => deleteChat(chat.id)}
          >
            {t("deleteChat")}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ChatDropdownTrigger;
