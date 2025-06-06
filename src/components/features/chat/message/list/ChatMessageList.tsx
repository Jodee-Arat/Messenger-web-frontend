import { FC, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  useChatMessageAddedSubscription,
  useFindAllMessagesByChatQuery,
  useRemoveMessagesMutation,
} from "@/graphql/generated/output";

import { decryptMessage } from "@/utils/crypto/decrypt-message";

import ChatToolbar from "../../toolbar/ChatToolbar";
import { MessageType } from "../../types/message.type";

import ChatMessageItem from "./ChatMessageItem";

interface ChatMessageListProp {
  chatId: string;
  userId: string;
  sessionKey: bigint;
  keyE: bigint;
  keyN: bigint;
}

const ChatMessageList: FC<ChatMessageListProp> = ({
  chatId,
  userId,
  sessionKey,
  keyE,
  keyN,
}) => {
  const [messageIds, setMessageIds] = useState<string[]>([]);

  const { data: allMessagesData, loading: isLoadingFindAllMessages } =
    useFindAllMessagesByChatQuery({
      variables: {
        chatId: chatId,
        filters: {},
      },
      fetchPolicy: "network-only",
    });

  const { data: newMessageData } = useChatMessageAddedSubscription({
    variables: {
      chatId,
      userId,
    },
  });

  const [messagesInfo, setMessagesInfo] = useState<MessageType[]>([]);

  const [removeMessages] = useRemoveMessagesMutation({
    onCompleted() {
      setMessageIds([]);

      toast.success("Messages deleted successfully.");
    },
    onError(err) {
      toast.error("Failed to delete messages: " + err.message);
    },
  });

  const handleClearMessageIds = useCallback(() => {
    if (messageIds.length === 0) return;
    removeMessages({
      variables: {
        chatId: chatId,
        data: {
          messageIds: messageIds,
        },
      },
    });
    setMessagesInfo((prevMessages) =>
      prevMessages.filter((message) => !messageIds.includes(message.id))
    );
    setMessageIds([]);
  }, [messageIds, chatId, removeMessages]);

  const handleChooseMessage = (messageId: string) => {
    if (messageIds.includes(messageId)) {
      setMessageIds((prev) => prev.filter((id) => id !== messageId));
    } else {
      setMessageIds((prev) => [...prev, messageId]);
    }
  };

  useEffect(() => {
    if (
      !allMessagesData ||
      !allMessagesData.findAllMessagesByChat ||
      !sessionKey ||
      !keyE ||
      !keyN
    )
      return;

    const decryptMessages = async () => {
      const messagesInfoArr: MessageType[] = [];

      for (const message of allMessagesData.findAllMessagesByChat) {
        if (message.text === "null") {
          messagesInfoArr.push(message);
          continue;
        }

        const decrypted = await decryptMessage(
          message,
          sessionKey.toString(),
          keyE,
          keyN
        );

        if (decrypted) {
          messagesInfoArr.push(decrypted);
        } else {
          console.error(
            `[${chatId}] FAILED Decrypting msg: ${message.id}, sessionKey (part): ${sessionKey.toString().substring(0, 10)}, keyN (part): ${keyN.toString().substring(0, 10)}`
          );
          toast.error("Decryption failed for message");
        }
      }

      setMessagesInfo(messagesInfoArr);
    };

    decryptMessages();
  }, [allMessagesData, sessionKey, keyE, keyN]);

  useEffect(() => {
    if (
      !newMessageData ||
      !newMessageData.chatMessageAdded ||
      !sessionKey ||
      !keyE ||
      !keyN
    )
      return;
    if (!newMessageData?.chatMessageAdded) return;
    const decryptMessages = async () => {
      const newMessage = newMessageData.chatMessageAdded;

      if (newMessage.text === "null") {
        setMessagesInfo((prevMessages) => [...prevMessages, newMessage]);
        return;
      }
      const decrypted = await decryptMessage(
        newMessage,
        sessionKey.toString(),
        keyE,
        keyN
      );

      if (decrypted) {
        setMessagesInfo((prevMessages) => [...prevMessages, decrypted]);
      }
    };
    decryptMessages();
  }, [newMessageData, sessionKey, keyE, keyN]);

  if (isLoadingFindAllMessages) {
    return (
      <div className="flex flex-1 items-center justify-center">Loading...</div>
    );
  }

  return (
    <>
      <ChatToolbar
        messageIds={messageIds}
        clearMessageIds={handleClearMessageIds}
      />
      <div className="flex flex-1 flex-col-reverse overflow-y-auto">
        <div className="mb-2 flex flex-col gap-y-1">
          {messagesInfo.map((messageInfo, index) => (
            <ChatMessageItem
              handleChooseMessage={handleChooseMessage}
              messageInfo={messageInfo}
              userId={userId}
              key={messageInfo.id}
              keyE={keyE}
              keyN={keyN}
              sessionKey={sessionKey}
              messageId={messagesInfo[index].id}
              messageIds={messageIds}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatMessageList;
