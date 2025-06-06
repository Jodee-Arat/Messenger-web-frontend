"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/common/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/common/DropdownMenu";

import { FindAllChatsByUserQuery } from "@/graphql/generated/output";

import { cn } from "@/utils/tw-merge";

interface ChatsSidebarItemProps {
  chat: FindAllChatsByUserQuery["findAllChatsByUser"][0];
  deleteChat: (chatId: string) => void;
}

const ChatsSidebarItem = ({ chat, deleteChat }: ChatsSidebarItemProps) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = pathname === `/chat/${chat.id}`;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        onClick={(e) => e.preventDefault()}
        onContextMenu={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        onPointerDown={(e) => {
          if (e.button === 0) {
            e.preventDefault();
          }
        }}
        className=""
      >
        <div className="">
          <Button
            className={cn("h-max", isActive && "bg-accent")}
            asChild
            variant="ghost"
          >
            <Link
              href={`/chat/${chat.id}`}
              className="flex w-full items-center justify-start space-x-2"
            >
              <Image
                src={"/images/avatar/rostik.jpg"}
                alt="frontend"
                width={40}
                height={40}
                className="size-15 rounded-full object-cover object-top"
              />
              <div className="flex flex-col space-y-1 text-start">
                <p className="text-[16px]">{chat.chatName}</p>
                <p className="text-muted-foreground text-sm">
                  ****************
                </p>
              </div>
            </Link>
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[230px]">
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => deleteChat(chat.id)}
        >
          Delete chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatsSidebarItem;
