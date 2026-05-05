import {
  useChatMessageAddedSubscription,
  useChatMessageRemovedSubscription,
  useFindAllMessagesByChatQuery,
  useRemoveMessagesMutation,
} from "@/shared/graphql/generated/output";
import { ForwardedMessageType } from "@/shared/types/forward/forwarded-message.type";
import { MessageType } from "@/shared/types/message.type";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import ChatToolbar from "../../toolbar/ChatToolbar";
import PinnedMessage from "./PinnedMessage";

import ChatMessageDropdownTrigger from "./ChatMessageDropdownTrigger";
import EmptyStateCard from "@/components/ui/elements/EmptyStateCard";
import { MessageSquareDashed } from "lucide-react";

interface ChatMessageListProp {
  pinnedMessage: MessageType | null;
  setPinnedMessage: (message: MessageType | null) => void;
  chatId: string;
  userId: string;
  startEdit: (
    message: MessageType,
    forwardedMessages?: ForwardedMessageType[],
  ) => void;
  handleAddForwardedMessage: (messages: MessageType[]) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
  canSend?: boolean;
  showSenderName?: boolean;
}

const ChatMessageList: FC<ChatMessageListProp> = ({
  chatId,
  pinnedMessage,
  setPinnedMessage,
  startEdit,
  userId,
  handleAddForwardedMessage,
  canEdit = true,
  canDelete = true,
  canPin = true,
  canSend = true,
  showSenderName = true,
}) => {
  const t = useTranslations("messages");
  const [messageIds, setMessageIds] = useState<string[]>([]);
  const [messagesInfo, setMessagesInfo] = useState<MessageType[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const didInitialScrollRef = useRef(false);

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

      toast.success(t("messagesDeletedSuccess"));
    },
    onError(err) {
      toast.error(t("failedDeleteMessages") + ": " + err.message);
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
      setMessageIds(prev => prev.filter(id => id !== messageId));
    } else {
      setMessageIds(prev => [...prev, messageId]);
    }
  };

  const handleAddForwarded = (messageIds: string[], reply = true) => {
    const messages = messagesInfo.filter(message =>
      messageIds.includes(message.id),
    );

    handleAddForwardedMessage(messages);
    setMessageIds([]);
  };

  const selectedMessage =
    messageIds.length === 1
      ? messagesInfo.find(message => message.id === messageIds[0]) ?? null
      : null;

  useEffect(() => {
    didInitialScrollRef.current = false;
    setMessageIds([]);
    setMessagesInfo([]);
  }, [chatId]);

  useEffect(() => {
    if (!allMessagesData || !allMessagesData.findAllMessagesByChat) return;

    const messagesInfoArr = allMessagesData.findAllMessagesByChat;

    setMessagesInfo(messagesInfoArr);
  }, [allMessagesData]);

  useEffect(() => {
    if (!newMessageData || !newMessageData.chatMessageAdded) return;

    const newMessage = newMessageData.chatMessageAdded;

    setMessagesInfo(prevMessages => {
      if (newMessage.isEdited) {
        return prevMessages.map(message =>
          message.id === newMessage.id
            ? ({
                ...message,
                ...newMessage,
                createdAt: message.createdAt,
              } as MessageType)
            : message,
        );
      }

      if (prevMessages.some(message => message.id === newMessage.id)) {
        return prevMessages;
      }

      return [...prevMessages, newMessage as MessageType];
    });
  }, [newMessageData]);

  useEffect(() => {
    if (!removedMessagesData || !removedMessagesData.chatMessageRemoved) return;

    const removedMessagesId = removedMessagesData.chatMessageRemoved;

    const removedIds = removedMessagesId.map(msg => msg.id);
    const updatedMessages = messagesInfo
      .filter(message => !removedIds.includes(message.id))
      .map(message => {
        const cleanedLinks =
          message.repliedToLinks?.filter(link => {
            return link?.repliedTo && !removedIds.includes(link.repliedTo.id);
          }) ?? [];

        return {
          ...message,
          repliedToLinks: cleanedLinks.length > 0 ? cleanedLinks : null,
        } as MessageType;
      });

    setMessagesInfo(updatedMessages);
  }, [removedMessagesData]);

  useEffect(() => {
    if (didInitialScrollRef.current || messagesInfo.length === 0) return;

    didInitialScrollRef.current = true;
    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      container.scrollTop = container.scrollHeight;
    });
  }, [messagesInfo.length]);

  if (isLoadingFindAllMessages) {
    return (
      <div className="flex flex-1 items-center justify-center">
        {t("loading")}
      </div>
    );
  }

  return (
    <>
      <ChatToolbar
        chatId={chatId}
        messageIds={messageIds}
        selectedMessage={selectedMessage}
        handleRemoveMessages={handleRemoveMessages}
        handleClearMessagesId={handleClearMessagesId}
        handleAddForwarded={handleAddForwarded}
        canSend={canSend}
        canEdit={canEdit}
        canDelete={canDelete}
        canPin={canPin}
        userId={userId}
        pinnedMessageId={pinnedMessage?.id ?? null}
        setPinnedMessage={setPinnedMessage}
        startEdit={startEdit}
      />
      <PinnedMessage
        chatId={chatId}
        pinnedMessage={pinnedMessage}
        setPinnedMessage={setPinnedMessage}
        canPin={canPin}
      />
      <div ref={scrollContainerRef} className="flex flex-1 overflow-y-auto px-1">
        <div className="mx-auto mb-2 flex w-full max-w-4xl flex-col gap-y-1.5">
          {messagesInfo.length === 0 ? (
            <EmptyStateCard
              icon={MessageSquareDashed}
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              className="mx-auto max-w-xl"
            />
          ) : (
            messagesInfo.map((messageInfo, index) =>
              messageInfo.isStarted ? (
                <div
                  key={messageInfo.id}
                  className="flex items-center gap-3 px-6 py-2"
                >
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">
                    {messageInfo.text}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              ) : (
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
                  canEdit={canEdit}
                  canDelete={canDelete}
                  canPin={canPin}
                  canSend={canSend}
                  showSenderName={showSenderName}
                />
              )
            )
          )}
        </div>
      </div>
    </>
  );
};

export default ChatMessageList;
