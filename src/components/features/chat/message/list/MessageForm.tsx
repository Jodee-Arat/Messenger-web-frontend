import Image from "next/image";
import { FC } from "react";

import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import { cn } from "@/utils/tw-merge";

import MessageFileList from "./file/MessageFileList";
import { MessageFileType } from "@/types/message-file.type";

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
}

const MessageForm: FC<MessageFormProp> = ({
  chatId,
  user,
  userId,
  files,
  isSelected,
  text,
  isEdited,
}) => {
  return (
    <div>
      <div
        className={cn(
          "flex items-start gap-3",
          user.id === userId ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div className="mt-1">
          <EntityAvatar
            name={user.username}
            avatarUrl={user.avatarUrl}
            size="default"
          />
        </div>

        <div className="flex min-w-0 max-w-[400px] flex-1 flex-col">
          <h3
            className={cn(
              user.id === userId ? "text-right" : "text-left",
              "font-semibold"
            )}
          >
            {user.username}
          </h3>
          {isEdited && <span className="text-xs text-gray-500">Edited</span>}
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
