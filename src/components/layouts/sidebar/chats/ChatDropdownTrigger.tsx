"use client";

import { useState } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/common/ContextMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/common/DropdownMenu";

import { FindAllChatsByUserQuery } from "@/graphql/generated/output";

import ChatsSidebarItem from "./ChatsSidebarItem";

interface ChatDropdownTriggerProps {
  chat: FindAllChatsByUserQuery["findAllChatsByUser"][0];
  deleteChat: (chatId: string) => void;
}

const ChatDropdownTrigger = ({
  chat,
  deleteChat,
}: ChatDropdownTriggerProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <ChatsSidebarItem chat={chat} />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[230px]">
        <ContextMenuItem
          className="text-destructive"
          onClick={() => deleteChat(chat.id)}
        >
          Delete chat
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ChatDropdownTrigger;
