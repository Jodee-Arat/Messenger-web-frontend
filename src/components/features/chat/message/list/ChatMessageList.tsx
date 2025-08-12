import { FC, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  useChatMessageAddedSubscription,
  useChatMessageRemovedSubscription,
  useFindAllMessagesByChatQuery,
  useRemoveMessagesMutation,
} from "@/graphql/generated/output";

import { MessageType } from "../../../../../types/message.type";
import ChatToolbar from "../../toolbar/ChatToolbar";
import PinnedMessage from "../PinnedMessage";

import ChatMessageDropdownTrigger from "./ChatMessageDropdownTrigger";
import { ForwardedMessageType } from "@/types/forward/forwarded-message.type";

interface ChatMessageListProp {
  pinnedMessage: MessageType | null;
  setPinnedMessage: (message: MessageType | null) => void;
  chatId: string;
  userId: string;
  startEdit: (
    message: MessageType,
    forwardedMessages?: ForwardedMessageType[]
  ) => void;
  handleAddForwardedMessage: (messages: MessageType[]) => void;
}

const ChatMessageList: FC<ChatMessageListProp> = ({
  chatId,
  pinnedMessage,
  setPinnedMessage,
  startEdit,
  userId,
  handleAddForwardedMessage,
}) => {
  const [messageIds, setMessageIds] = useState<string[]>([]);
  const [messagesInfo, setMessagesInfo] = useState<MessageType[]>([]);

  const { data: allMessagesData, loading: isLoadingFindAllMessages } =
    useFindAllMessagesByChatQuery({
      variables: {
        chatId,
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

  const { data: removedMessagesData } = useChatMessageRemovedSubscription({
    variables: {
      chatId,
      userId,
    },
  });

  const [removeMessages] = useRemoveMessagesMutation({
    onCompleted() {
      setMessageIds([]);

      toast.success("Messages deleted successfully.");
    },
    onError(err) {
      toast.error("Failed to delete messages: " + err.message);
    },
  });

  const handleRemoveMessages = useCallback(() => {
    if (messageIds.length === 0) return;
    removeMessages({
      variables: {
        chatId: chatId,
        data: {
          messageIds: messageIds,
        },
      },
    });
  }, [messageIds, chatId, removeMessages]);

  const handleClearMessagesId = () => {
    setMessageIds([]);
  };

  const handleChooseMessage = (messageId: string) => {
    if (messageIds.includes(messageId)) {
      setMessageIds((prev) => prev.filter((id) => id !== messageId));
    } else {
      setMessageIds((prev) => [...prev, messageId]);
    }
  };

  const handleAddForwarded = (messageIds: string[], reply = true) => {
    const messages = messagesInfo.filter((message) =>
      messageIds.includes(message.id)
    );

    handleAddForwardedMessage(messages);
    setMessageIds([]);
  };

  useEffect(() => {
    if (!allMessagesData || !allMessagesData.findAllMessagesByChat) return;

    const messagesInfoArr = allMessagesData.findAllMessagesByChat;

    setMessagesInfo(messagesInfoArr);
  }, [allMessagesData]);

  useEffect(() => {
    if (!newMessageData || !newMessageData.chatMessageAdded) return;

    const newMessage = newMessageData.chatMessageAdded;

    if (newMessage.isEdited) {
      setMessagesInfo((prevMessages) =>
        prevMessages.map((message) =>
          message.id === newMessage.id ? newMessage : message
        )
      );
      return;
    }
    setMessagesInfo((prevMessages) => [...prevMessages, newMessage]);
  }, [newMessageData]);

  useEffect(() => {
    if (!removedMessagesData || !removedMessagesData.chatMessageRemoved) return;

    const removedMessagesId = removedMessagesData.chatMessageRemoved;

    const removedIds = removedMessagesId.map((msg) => msg.id);
    const updatedMessages = messagesInfo
      .filter((message) => !removedIds.includes(message.id))
      .map((message) => {
        const cleanedLinks =
          message.repliedToLinks?.filter((link) => {
            return link?.repliedTo && !removedIds.includes(link.repliedTo.id);
          }) ?? [];

        return {
          ...message,
          repliedToLinks: cleanedLinks.length > 0 ? cleanedLinks : null,
        };
      });

    setMessagesInfo(updatedMessages);
  }, [removedMessagesData]);

  if (isLoadingFindAllMessages) {
    return (
      <div className="flex flex-1 items-center justify-center">Loading...</div>
    );
  }

  return (
    <>
      <ChatToolbar
        chatId={chatId}
        messageIds={messageIds}
        handleRemoveMessages={handleRemoveMessages}
        handleClearMessagesId={handleClearMessagesId}
        handleAddForwarded={handleAddForwarded}
      />
      <PinnedMessage
        chatId={chatId}
        pinnedMessage={pinnedMessage}
        setPinnedMessage={setPinnedMessage}
      />
      <div className="flex flex-1 flex-col-reverse overflow-y-auto">
        <div className="mb-2 flex flex-col gap-y-1">
          {messagesInfo.length === 0 ? (
            <div>Пусто</div>
          ) : (
            messagesInfo.map((messageInfo, index) => (
              <ChatMessageDropdownTrigger
                startEdit={startEdit}
                handleAddForwardedMessage={handleAddForwardedMessage}
                handleClearMessagesId={handleClearMessagesId}
                handleChooseMessage={handleChooseMessage}
                messageInfo={messageInfo}
                userId={userId}
                key={messageInfo.id}
                messageId={messagesInfo[index].id}
                messageIds={messageIds}
                chatId={chatId}
                setPinnedMessage={setPinnedMessage}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ChatMessageList;
