import { MessageFileType } from "@/shared/types/message-file.type";
import { FC } from "react";

import MessageFileItem from "./MessageFileItem";

interface MessageFileListProp {
  files: MessageFileType[];
  chatId: string;
  isSelected: boolean;
  isOwnMessage?: boolean;
}

const MessageFileList: FC<MessageFileListProp> = ({
  files,
  chatId,
  isSelected,
  isOwnMessage = false,
}) => {
  if (!files || files.length === 0) return null;

  return (
    <div
      onClick={event => {
        if (!isSelected) {
          event.stopPropagation();
        }
      }}
    >
      <div className="mt-2 flex flex-wrap gap-2">
        {files.map(file => (
          <MessageFileItem
            isSelected={isSelected}
            file={file}
            key={file.id}
            chatId={chatId}
            isOwnMessage={isOwnMessage}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageFileList;
