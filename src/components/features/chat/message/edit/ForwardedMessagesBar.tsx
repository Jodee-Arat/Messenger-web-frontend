import { X } from "lucide-react";
import { FC } from "react";

import { Button } from "@/components/ui/common/Button";
import { Separator } from "@/components/ui/common/Separator";

import { cn } from "@/utils/tw-merge";

import { ForwardedMessageType } from "@/types/forward/forwarded-message.type";
import { MessageType } from "@/types/message.type";

interface ForwardedMessagesBarProp {
  forwardedMessages: ForwardedMessageType[];
  setForwardedMessages: (messages: ForwardedMessageType[]) => void;
}

const ForwardedMessagesBar: FC<ForwardedMessagesBarProp> = ({
  setForwardedMessages,
  forwardedMessages,
}) => {
  const usernames = new Set<string>();
  forwardedMessages.forEach((message) => usernames.add(message.user.username));
  return (
    <div className="flex justify-between">
      <div className="flex cursor-pointer items-center space-x-2">
        {forwardedMessages.length > 1 ? (
          <>
            <Separator orientation="vertical" className="p-[1.5px]" />
            <div>
              <h3 className="">
                {Array.from(usernames.values()).map((username, index) => (
                  <span
                    key={username}
                    className={cn("text-sm", index > 0 && "ml-1")}
                  >
                    {username}
                    {index < usernames.size - 1 ? "," : ""}
                  </span>
                ))}
              </h3>
              <span className="text-xs">
                {forwardedMessages.length} messages
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col space-y-0.5">
            <span>{forwardedMessages[0].user.username}</span>
            <>
              <span className="w-80 truncate text-xs">
                {forwardedMessages[0].text ?? ""}
              </span>
              <span className="text-xs">
                {forwardedMessages[0].files &&
                  forwardedMessages[0].files.length > 0 && (
                    <>
                      <span>{forwardedMessages[0].files.length}</span>
                      {forwardedMessages[0].files.length > 1 ? (
                        <span className="ml-1">files</span>
                      ) : (
                        <span className="ml-1">file</span>
                      )}
                    </>
                  )}
              </span>
            </>
          </div>
        )}
      </div>
      <Button
        onClick={() => setForwardedMessages([])}
        className="p-0"
        variant="ghost"
        size="icon"
        asChild
      >
        <X className="size-7.5 p-0.5 px-1" />
      </Button>
    </div>
  );
};

export default ForwardedMessagesBar;
