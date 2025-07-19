"use client";

import { FC } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";
import DragAndDropWrapper from "@/components/ui/elements/DragAndDropWrapper";

import { useChat } from "@/hooks/useChat";
import { useCurrent } from "@/hooks/useCurrent";

import EditMessageForm from "./message/edit/EditMessageForm";
import ChatMessageList from "./message/list/ChatMessageList";
import SendMessageForm from "./message/send/SendMessageForm";

interface ChatProp {
  chatId: string;
}

const Chat: FC<ChatProp> = ({ chatId }) => {
  const { user, isLoadingProfile } = useCurrent();

  const {
    files,
    setFiles,
    isLoadingSendFile,
    handleDelete,
    handleClearMessageId,
    drop,
    forwardedMessages,
    setForwardedMessages,
    handleAddForwardedMessage,
    isLoadingFindChat,
    draftText,
    chat,
    editId,
    startEdit,
    handleClearTextForm,
    setEditId,
    filesCopy,
    setFilesCopy,
    forwardedMessagesCopy,
    setForwardedMessagesCopy,
    textCopy,
    setTextCopy,
  } = useChat(chatId);

  if (isLoadingFindChat || isLoadingProfile || !user || !chat) {
    return <div>Loading...</div>;
  }

  return (
    <Card
      className="fixed mt-[75px] flex w-[50%] flex-col"
      style={{ height: "calc(100vh - 91px)" }}
    >
      <CardHeader className="border-b py-5">
        <CardTitle className="text-center text-lg">{chat?.chatName}</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col overflow-y-auto p-4">
        <DragAndDropWrapper drop={drop} className="flex h-full flex-col">
          <ChatMessageList
            chatId={chatId}
            startEdit={startEdit}
            userId={user!.id}
            handleAddForwardedMessage={handleAddForwardedMessage}
          />
          <div className="">
            {editId === null ? (
              <SendMessageForm
                handleClearTextForm={handleClearTextForm}
                setForwardedMessages={setForwardedMessages}
                draftText={draftText}
                forwardedMessages={forwardedMessages}
                onDeleteFile={handleDelete}
                files={files}
                isLoadingSendFiles={isLoadingSendFile}
                chatId={chatId}
                clearMessageId={handleClearMessageId}
              />
            ) : (
              <EditMessageForm
                editId={editId}
                setEditId={setEditId}
                text={textCopy}
                setText={setTextCopy}
                forwardedMessages={forwardedMessagesCopy}
                setForwardedMessages={setForwardedMessagesCopy}
                files={filesCopy}
                setFiles={setFilesCopy}
                isLoadingSendFiles={isLoadingSendFile}
                chatId={chatId}
                clearMessageId={handleClearMessageId}
              />
            )}
          </div>
        </DragAndDropWrapper>
      </CardContent>
    </Card>
  );
};

export default Chat;
