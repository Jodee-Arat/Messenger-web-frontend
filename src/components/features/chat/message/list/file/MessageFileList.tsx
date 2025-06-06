import { FC } from "react";

import { messageType } from "../../../types/message-file.type";

import MessageFileItem from "./MessageFileItem";

interface MessageFileListProp {
  files: messageType[];
  sessionKey: bigint;
  keyE: bigint;
  keyN: bigint;
}

const MessageFileList: FC<MessageFileListProp> = ({
  files,
  keyE,
  keyN,
  sessionKey,
}) => {
  return (
    <div>
      {files && (
        <div className="flex flex-wrap space-x-4 space-y-1">
          {files.map((file, index) => (
            <MessageFileItem
              file={file}
              key={index}
              sessionKey={sessionKey}
              keyE={keyE}
              keyN={keyN}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageFileList;
