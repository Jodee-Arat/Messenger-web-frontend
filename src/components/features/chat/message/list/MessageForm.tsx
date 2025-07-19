import Image from "next/image";
import { FC } from "react";

import { cn } from "@/utils/tw-merge";

import MessageFileList from "./file/MessageFileList";
import { MessageFileType } from "@/types/message-file.type";

interface MessageFormProp {
  chatId: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
  text?: string | null;
  files?: MessageFileType[] | null | undefined;
  isSelected: boolean;
}

const MessageForm: FC<MessageFormProp> = ({
  chatId,
  user,
  userId,
  files,
  isSelected,
  text,
}) => {
  return (
    <div>
      <div
        className={cn(
          "flex items-start gap-3",
          user.id === userId ? "flex-row-reverse" : "flex-row"
        )}
      >
        <Image
          src={"/images/avatar/avatar.png"}
          alt={user.username}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex min-w-0 max-w-[400px] flex-1 flex-col">
          <h3
            className={cn(
              user.id === userId ? "text-right" : "text-left",
              "font-semibold"
            )}
          >
            {user.username}
          </h3>
          {text && text !== "null" && (
            <p className="break-words text-left text-sm">{text}</p>
          )}
          <MessageFileList
            isSelected={isSelected}
            files={files!}
            chatId={chatId}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageForm;
