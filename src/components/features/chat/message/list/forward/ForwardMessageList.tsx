import { FC } from "react";

import MessageForm from "../MessageForm";

import { ForwardedMessageType } from "@/types/forward/forwarded-message.type";

interface ForwardMessageListProp {
  forwardedMessagesInfo: ForwardedMessageType[];
  userId: string;
  chatId: string;
  isSelected: boolean;
}
const ForwardMessageList: FC<ForwardMessageListProp> = ({
  chatId,
  forwardedMessagesInfo,
  userId,
  isSelected,
}) => {
  return (
    <>
      {forwardedMessagesInfo.map((message, index) => (
        <MessageForm
          key={index}
          chatId={chatId}
          isSelected={isSelected}
          user={message.user}
          userId={userId}
          files={message.files}
          text={message.text}
        />
      ))}
    </>
  );
};

export default ForwardMessageList;
