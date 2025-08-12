"use client";

import { Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";

import { Button } from "@/components/ui/common/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";
import DragAndDropWrapper from "@/components/ui/elements/DragAndDropWrapper";

import { useChat } from "@/hooks/useChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import ChatMessageList from "./message/list/ChatMessageList";
import SendMessageForm from "./message/send/SendMessageForm";

interface ChatProp {
  chatId: string;
}

const Chat: FC<ChatProp> = ({ chatId }) => {
  const { user, isLoadingProfile } = useCurrentUser();

  const pathname = usePathname();

  const {
    files,
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
    handleClearForm,
    setEditId,
    filesEdited,
    setFilesEdited,
    pinnedMessage,
    setPinnedMessage,
    handleFileSend,
  } = useChat(chatId);

  if (isLoadingFindChat || isLoadingProfile || !user || !chat) {
    return <div>Loading...</div>;
  }

  return (
    <Card
      className="fixed mt-[75px] flex w-[50%] flex-col"
      style={{ height: "calc(100vh - 107px)" }}
    >
      <CardHeader className="flex flex-row items-center justify-between border-b py-5">
        <CardTitle className="pt-1 text-center text-xl">
          {chat?.chatName}
        </CardTitle>
        <div className="">
          <Button className="" size="icon" variant="default">
            <Link href={`${pathname}/settings`}>
              <Settings2 />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex h-full flex-col overflow-y-auto p-4">
        <DragAndDropWrapper drop={drop} className="flex h-full flex-col">
          <ChatMessageList
            pinnedMessage={pinnedMessage}
            setPinnedMessage={setPinnedMessage}
            chatId={chatId}
            startEdit={startEdit}
            userId={user!.id}
            handleAddForwardedMessage={handleAddForwardedMessage}
          />
          <SendMessageForm
            handleFileSend={handleFileSend}
            handleClearForm={handleClearForm}
            setForwardedMessages={setForwardedMessages}
            draftText={draftText}
            forwardedMessages={forwardedMessages}
            onDeleteFile={handleDelete}
            files={files}
            isLoadingSendFiles={isLoadingSendFile}
            chatId={chatId}
            clearMessageId={handleClearMessageId}
            editId={editId}
            setEditId={setEditId}
            filesEdited={filesEdited}
            setFilesEdited={setFilesEdited}
          />
        </DragAndDropWrapper>
      </CardContent>
    </Card>
  );
};

export default Chat;
