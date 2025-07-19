import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SendFileType } from "@/components/features/chat/types/send-file.type";

import {
  useFindChatByChatIdQuery,
  useRemoveFileMutation,
  useSendFileMutation,
} from "@/graphql/generated/output";

import { ForwardedMessageType } from "@/types/forward/forwarded-message.type";
import { MessageType } from "@/types/message.type";

export const useChat = (chatId: string) => {
  const [messageId, setMessageId] = useState<string | null>(null);

  const [forwardedMessages, setForwardedMessages] = useState<
    ForwardedMessageType[]
  >([]);
  const [files, setFiles] = useState<SendFileType[]>([]);
  const [draftText, setDraftText] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);

  const [filesCopy, setFilesCopy] = useState<SendFileType[]>([]);
  const [forwardedMessagesCopy, setForwardedMessagesCopy] = useState<
    ForwardedMessageType[]
  >([]);
  const [textCopy, setTextCopy] = useState<string>("");

  const { data: chatData, loading: isLoadingFindChat } =
    useFindChatByChatIdQuery({
      variables: {
        chatId,
      },
      fetchPolicy: "network-only",
    });
  const chat = chatData?.findChatByChatId;

  useEffect(() => {
    if (!chat) return;

    const draft = chat.draftMessages?.[0];
    if (!draft) return;
    setDraftText(draft.text ?? "");
    if (draft?.repliedToLinks) {
      const forwarded = draft.repliedToLinks
        .map((reply) => reply?.repliedTo)
        .filter((msg): msg is MessageType => !!msg);
      setForwardedMessages(forwarded);
    }

    if (draft?.files) {
      const files = draft.files.map((file) => ({
        name: file.fileName,
        size: file.fileSize.toString(),
        id: file.id,
      }));
      setFiles(files);
    }
  }, [chat]);

  const [send, { loading: isLoadingSendFile }] = useSendFileMutation({
    onCompleted(data) {
      setMessageId(data.sendFile.chatMessageId);
      setFiles((prevFilesId) => [
        ...prevFilesId.slice(0, -1),
        { ...prevFilesId[prevFilesId.length - 1], id: data.sendFile.fileId },
      ]);
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  const handleClearTextForm = () => {
    setDraftText("");
    setFiles([]);
    setForwardedMessages([]);
  };

  const [removeFile] = useRemoveFileMutation({
    onError(err) {
      toast.error("Failed to remove file: " + err.message);
    },
  });

  const handleAddForwardedMessage = (messages: ForwardedMessageType[]) =>
    setForwardedMessages(messages);

  const handleDelete = (id: string) => {
    setMessageId(null);
    removeFile({
      variables: { fileId: id, chatId },
    });
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleClearMessageId = () => setMessageId(null);

  const startEdit = (
    message: MessageType,
    forwardedMessages?: ForwardedMessageType[]
  ) => {
    setEditId(message.id);
    setTextCopy(message.text ?? "");
    setFilesCopy(
      message.files?.map((file) => ({
        name: file.fileName,
        size: file.fileSize.toString(),
        id: file.id,
      })) ?? []
    );
    setForwardedMessagesCopy(forwardedMessages ?? []);
  };

  const drop = async (e: React.DragEvent<HTMLDivElement>) => {
    const file = e.dataTransfer.files[0];

    if (files.length < 7) {
      if (files.some((fileState) => fileState.name === file.name)) {
        toast.error("File with this name already exists in the chat.");
        return;
      }

      setFiles((prevFiles) => [
        ...prevFiles,
        { name: file.name, size: file.size.toString(), id: "" },
      ]);

      send({
        variables: {
          chatId,
          file,
          messageId: messageId ?? "null",
        },
      });
    } else {
      toast.error("You can only upload up to 5 files at a time.");
    }
  };

  return {
    files,
    setFiles,
    messageId,
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
    setEditId,
    editId,
    startEdit,
    handleClearTextForm,
    filesCopy,
    setFilesCopy,
    forwardedMessagesCopy,
    setForwardedMessagesCopy,
    textCopy,
    setTextCopy,
  };
};
