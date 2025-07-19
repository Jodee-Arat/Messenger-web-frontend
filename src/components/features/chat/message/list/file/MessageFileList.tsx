import { FC } from "react";

import MessageFileItem from "./MessageFileItem";
import { MessageFileType } from "@/types/message-file.type";

interface MessageFileListProp {
  files: MessageFileType[];
  chatId: string;
  isSelected: boolean;
}

const MessageFileList: FC<MessageFileListProp> = ({
  files,
  chatId,
  isSelected,
}) => {
  return (
    <div onClick={(e) => (!isSelected ? e.stopPropagation() : "")}>
      {files && (
        <div className="flex flex-wrap space-x-4 space-y-1">
          {files.map((file, index) => (
            <MessageFileItem
              isSelected={isSelected}
              file={file}
              key={index}
              chatId={chatId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageFileList;
