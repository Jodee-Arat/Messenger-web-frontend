import {
  useFindChatByChatIdQuery,
  useRemoveFileMutation,
  useSendFileMutation,
} from "@/shared/graphql/generated/output";
import { ForwardedMessageType } from "@/shared/types/forward/forwarded-message.type";
import { MessageFileType } from "@/shared/types/message-file.type";
import { MessageType } from "@/shared/types/message.type";
import { SendFileType } from "@/shared/types/send-file.type";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getGraphQLErrorMessage,
  isDirectContactBlockedError,
} from "@/shared/utils/direct-contact-blocked";

export const useChat = (
  chatId: string,
  onDirectContactBlocked?: () => void,
) => {
  const [messageId, setMessageId] = useState<string | null>(null);

  const [forwardedMessages, setForwardedMessages] = useState<
    ForwardedMessageType[]
  >([]);
  const [files, setFiles] = useState<SendFileType[]>([]);
  const [draftText, setDraftText] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<MessageType | null>(null);

  const [filesEdited, setFilesEdited] = useState<SendFileType[]>([]);

  const {
    data: chatData,
    loading: isLoadingFindChat,
    error: chatError,
    refetch: refetchChat,
  } = useFindChatByChatIdQuery({
    variables: {
      chatId,
    },
    fetchPolicy: "network-only",
  });
  const chat = chatData?.findChatByChatId;

  useEffect(() => {
    if (chatError && isDirectContactBlockedError(chatError)) {
      onDirectContactBlocked?.();
    }
  }, [chatError, onDirectContactBlocked]);

  useEffect(() => {
    if (!chat) return;

    setPinnedMessage(chat.pinnedMessage ?? null);

    const draft = chat.draftMessages?.[0];
    if (!draft) return;

    setDraftText(draft.text ?? "");
    setEditId(draft?.editId ?? null);

    if (draft?.repliedToLinks) {
      const forwarded = draft.repliedToLinks
        .map((reply) => reply?.repliedTo)
        .filter((message): message is MessageType => !!message);
      setForwardedMessages(forwarded);
    }

    if (draft?.files) {
      const draftFiles = draft.files.map((file) => ({
        name: file.fileName,
        size: file.fileSize.toString(),
        id: file.id,
      }));
      setFiles(draftFiles);
    }
  }, [chat]);

  const [send, { loading: isLoadingSendFile }] = useSendFileMutation({
    onCompleted(data) {
      setMessageId(data.sendFile.chatDraftMessageId);
      setFiles((prevFilesId) => [
        ...prevFilesId.slice(0, -1),
        { ...prevFilesId[prevFilesId.length - 1], id: data.sendFile.fileId },
      ]);
    },
    onError(error) {
      if (isDirectContactBlockedError(error)) {
        onDirectContactBlocked?.();
        return;
      }

      toast.error(getGraphQLErrorMessage(error));
    },
  });

  const handleClearForm = () => {
    setDraftText("");
    setFiles([]);
    setForwardedMessages([]);
    setFilesEdited([]);
    setEditId(null);
    setFilesEdited([]);
  };

  const [removeFile] = useRemoveFileMutation({
    onError(error) {
      if (isDirectContactBlockedError(error)) {
        onDirectContactBlocked?.();
        return;
      }

      toast.error("Failed to remove file: " + getGraphQLErrorMessage(error));
    },
  });

  const handleAddForwardedMessage = (messages: ForwardedMessageType[]) =>
    setForwardedMessages(messages);

  const handleDelete = (id: string) => {
    setMessageId(null);
    let isFileEdited = false;

    setFiles((prev) =>
      prev.filter((file) => {
        if (file.id === id) {
          isFileEdited = true;
        }

        return file.id !== id;
      }),
    );

    if (isFileEdited) {
      return;
    }

    removeFile({
      variables: { fileId: id, chatId },
    });
  };

  const handleClearMessageId = () => setMessageId(null);

  const startEdit = (
    message: MessageType,
    forwardedMessages?: ForwardedMessageType[],
  ) => {
    setEditId(message.id);
    setDraftText(message.text ?? "");
    setFiles(
      (message.files ?? []).map((file: MessageFileType) => ({
        name: file.fileName,
        size: file.fileSize.toString(),
        id: file.id,
      })),
    );
    setForwardedMessages(forwardedMessages ?? []);
  };

  const handleFileSend = async (file: File) => {
    if (files.length >= 7) {
      toast.error("You can only upload up to 5 files at a time.");
      return;
    }

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
    handleClearForm,
    setFilesEdited,
    filesEdited,
    pinnedMessage,
    setPinnedMessage,
    handleFileSend,
    chatError,
    refetchChat,
  };
};
