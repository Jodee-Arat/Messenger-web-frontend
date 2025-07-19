import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/common/Button";

import { FindAllChatsByUserQuery } from "@/graphql/generated/output";

import { cn } from "@/utils/tw-merge";

interface ChatsSidebarItemProps {
  chat: FindAllChatsByUserQuery["findAllChatsByUser"][0];
}

const ChatsSidebarItem = ({ chat }: ChatsSidebarItemProps) => {
  const pathname = usePathname();

  const isActive = pathname === `/chat/${chat.id}`;

  return (
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
            <div>
              {chat.draftMessages &&
              chat.draftMessages.length > 0 &&
              chat.draftMessages[0]?.text ? (
                <p className="text-xs text-red-500">
                  {chat.draftMessages[0]?.text}
                </p>
              ) : chat.draftMessages &&
                chat.draftMessages.length > 0 &&
                chat.draftMessages[0].files?.length &&
                chat.draftMessages[0].files.length > 0 ? (
                <p className="text-xs text-blue-400">
                  {chat.draftMessages[0].files.length} файл(ов)
                </p>
              ) : chat.lastMessage && chat.lastMessage?.text ? (
                <div className="flex items-center space-x-2">
                  <h5 className="text-primary-foreground/80">
                    {chat.lastMessage.user.username}
                  </h5>
                  <p className="text-muted-foreground text-xs">
                    {chat.lastMessage?.text}
                  </p>
                </div>
              ) : chat.lastMessage &&
                chat.lastMessage.files?.length &&
                chat.lastMessage.files.length > 0 ? (
                <div className="flex items-center space-x-2">
                  <h5 className="text-primary-foreground/80">
                    {chat.lastMessage.user.username}
                  </h5>
                  <p className="text-xs text-blue-400">
                    {chat.lastMessage.files.length} файл(ов)
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">Пусто</p>
              )}
            </div>
          </div>
        </Link>
      </Button>
    </div>
  );
};

export default ChatsSidebarItem;
