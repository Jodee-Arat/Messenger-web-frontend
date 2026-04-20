import { zodResolver } from "@hookform/resolvers/zod";
import {
  useRemoveDraftMutation,
  useSendChatDraftMessageMutation,
  useSendChatMessageMutation,
} from "@/shared/graphql/generated/output";
import {
  SendMessageSchemaType,
  sendMessageSchema,
} from "@/shared/schemas/chat/send-message.schema";
import { ForwardedMessageType } from "@/shared/types/forward/forwarded-message.type";
import { SendFileType } from "@/shared/types/send-file.type";
import { haveItemsChangedById } from "@/shared/utils/have-items-changedById";
import { Check, Paperclip, SendHorizonal, X } from "lucide-react";
import { ChangeEvent, FC, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  getGraphQLErrorMessage,
  isDirectContactBlockedError,
} from "@/shared/utils/direct-contact-blocked";

import { Button } from "@/components/ui/common/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/common/Form";
import { Input } from "@/components/ui/common/Input";
import { Textarea } from "@/components/ui/common/Textarea";

import ForwardedMessagesBar from "./ForwardedMessagesBar";
import FileList from "./file/FileList";

const CHAT_DRAFT_REFETCH_QUERIES = [
  "FindAllChatsByUser",
  "FindAllChatsByGroup",
  "FindChatByChatId",
];
const MIN_TEXTAREA_HEIGHT = 40;
const MAX_TEXTAREA_HEIGHT = 128;

interface SendMessageFormProp {
  handleFileSend: (file: File) => void;
  handleClearForm: () => void;
  chatId: string;
  files: SendFileType[];
  editId?: string | null;
  setEditId: (editId: string | null) => void;
  setForwardedMessages: (messages: ForwardedMessageType[]) => void;
  isLoadingSendFiles: boolean;
  forwardedMessages?: ForwardedMessageType[];
  onDeleteFile: (id: string) => void;
  clearMessageId: () => void;
  draftText: string;
  filesEdited: SendFileType[];
  setFilesEdited: (files: SendFileType[]) => void;
  canSend?: boolean;
  onTyping?: () => void;
  onDirectContactBlocked?: () => void;
}

const SendMessageForm: FC<SendMessageFormProp> = ({
  handleFileSend,
  handleClearForm,
  chatId,
  files,
  isLoadingSendFiles,
  onDeleteFile,
  clearMessageId,
  forwardedMessages,
  setForwardedMessages,
  draftText,
  editId,
  setEditId,
  filesEdited,
  setFilesEdited,
  canSend = true,
  onTyping,
  onDirectContactBlocked,
}) => {
  const forwardedMessagesRef = useRef(forwardedMessages);
  const filesRef = useRef(files);
  const draftTextRef = useRef(draftText);
  const editIdRef = useRef(editId);
  const filesEditedRef = useRef(filesEdited);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const shouldRefocusAfterSendRef = useRef(false);
  const shouldPersistDraftOnUnmountRef = useRef(true);

  const t = useTranslations("messages");

  const syncTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(
      Math.max(textarea.scrollHeight, MIN_TEXTAREA_HEIGHT),
      MAX_TEXTAREA_HEIGHT,
    )}px`;
  }, []);

  const resetTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
  }, []);

  const focusInput = useCallback(() => {
    const focus = () => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.focus({ preventScroll: true });
      const cursorPosition = textarea.value.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    };

    requestAnimationFrame(() => {
      setTimeout(focus, 0);
    });
  }, []);

  const form = useForm<SendMessageSchemaType>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      text: draftTextRef.current ?? "",
    },
  });

  const [sendMessage, { loading: isLoadingSendMessage }] =
    useSendChatMessageMutation({
      refetchQueries: CHAT_DRAFT_REFETCH_QUERIES,
      onCompleted() {
        forwardedMessagesRef.current = [];
        filesRef.current = [];
        draftTextRef.current = "";
        editIdRef.current = null;
        filesEditedRef.current = [];
        form.reset();
        handleClearForm();
        requestAnimationFrame(resetTextareaHeight);
        shouldRefocusAfterSendRef.current = true;
      },
      onError(error) {
        shouldPersistDraftOnUnmountRef.current = true;
        shouldRefocusAfterSendRef.current = false;
        if (isDirectContactBlockedError(error)) {
          onDirectContactBlocked?.();
          return;
        }

        toast.error(getGraphQLErrorMessage(error));
      },
    });
  const [sendDraft] = useSendChatDraftMessageMutation({
    refetchQueries: CHAT_DRAFT_REFETCH_QUERIES,
    onCompleted() {
      forwardedMessagesRef.current = [];
      filesRef.current = [];
      draftTextRef.current = "";
      editIdRef.current = null;
      filesEditedRef.current = [];
      form.reset();
      handleClearForm();
      requestAnimationFrame(resetTextareaHeight);
    },
    onError(error) {
      if (isDirectContactBlockedError(error)) {
        onDirectContactBlocked?.();
        return;
      }

      toast.error(getGraphQLErrorMessage(error));
    },
  });

  const [removeDraftMessage, { loading: isLoadingRemoveDraft }] =
    useRemoveDraftMutation({
      refetchQueries: CHAT_DRAFT_REFETCH_QUERIES,
      onCompleted() {
        forwardedMessagesRef.current = [];
        filesRef.current = [];
        draftTextRef.current = "";
        editIdRef.current = null;
        filesEditedRef.current = [];
        form.reset();
        handleClearForm();
        requestAnimationFrame(resetTextareaHeight);
      },
      onError(error) {
        if (isDirectContactBlockedError(error)) {
          onDirectContactBlocked?.();
          return;
        }

        toast.error(getGraphQLErrorMessage(error));
      },
    });

  const textValue = form.watch("text")?.trim() ?? "";
  const hasFiles = files.length > 0 || filesEdited.length > 0;
  const canSendMessage = canSend && (textValue !== "" || files.length > 0);
  const isBusy =
    isLoadingSendMessage || isLoadingSendFiles || isLoadingRemoveDraft;

  const handleFileInputChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileSend(file);
    }
    event.target.value = "";
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFilesEdited([]);
    clearMessageId();
    void removeDraftMessage({
      variables: {
        chatId,
      },
    }).catch(() => {});
  };

  const onSubmit = async (
    data: SendMessageSchemaType,
    attachedFiles: SendFileType[],
    activeForwardedMessages?: ForwardedMessageType[],
    activeEditId?: string | null,
    activeFilesEdited: SendFileType[] = [],
    isDraft = false,
  ) => {
    const trimmedText = data.text ? data.text.trim() : "";
    const forwardedMessageIds = activeForwardedMessages
      ? activeForwardedMessages.map((message) => message.id)
      : [];
    const filesId = attachedFiles.map((file) => file.id);

    if (isDraft) {
      if (
        trimmedText === "" &&
        filesId.length === 0 &&
        forwardedMessageIds.length === 0
      ) {
        await removeDraftMessage({
          variables: {
            chatId,
          },
        }).catch(() => {});
        return;
      }

      await sendDraft({
        variables: {
          data: {
            editId: activeEditId ?? undefined,
            text: trimmedText !== "" ? trimmedText : null,
            forwardedMessageIds:
              forwardedMessageIds.length > 0 ? forwardedMessageIds : undefined,
            fileIds: filesId,
            targetChatsId: [chatId],
          },
          chatId,
        },
      }).catch(() => {});

      return;
    }

    if (trimmedText !== "" || attachedFiles.length > 0) {
      shouldPersistDraftOnUnmountRef.current = false;
      shouldRefocusAfterSendRef.current = true;
      await sendMessage({
        variables: {
          data: {
            editId: activeEditId ?? undefined,
            text: trimmedText !== "" ? trimmedText : null,
            forwardedMessageIds:
              forwardedMessageIds.length > 0 ? forwardedMessageIds : undefined,
            fileIds: filesId,
            targetChatsId: [chatId],
          },
          chatId,
        },
      }).catch(() => {});
    }

    setForwardedMessages([]);
    clearMessageId();
  };

  useEffect(() => {
    forwardedMessagesRef.current = forwardedMessages;
    filesRef.current = files;
    draftTextRef.current = draftText;
    editIdRef.current = editId;
    filesEditedRef.current = filesEdited;
    form.reset({
      text: draftText,
    });
    requestAnimationFrame(syncTextareaHeight);
  }, [draftText, editId, files, filesEdited, forwardedMessages, form]);

  useEffect(() => {
    if (
      files.length > 0 ||
      filesEdited.length > 0 ||
      (forwardedMessages?.length ?? 0) > 0
    ) {
      shouldPersistDraftOnUnmountRef.current = true;
    }
  }, [files, filesEdited, forwardedMessages]);

  useEffect(() => {
    return () => {
      if (!shouldPersistDraftOnUnmountRef.current) {
        return;
      }

      const values = form.getValues();
      const isForwardedMessagesChanged = haveItemsChangedById(
        forwardedMessagesRef.current ?? [],
        forwardedMessages ?? [],
      );
      const isFilesChanged = haveItemsChangedById(
        filesRef.current ?? [],
        files,
      );
      const isTextChanged = values.text !== draftTextRef.current;

      if (!isForwardedMessagesChanged && !isFilesChanged && !isTextChanged) {
        return;
      }

      void onSubmit(
        values,
        filesRef.current,
        forwardedMessagesRef.current,
        editIdRef.current,
        filesEditedRef.current,
        true,
      );
    };
  }, [files, form, forwardedMessages]);

  useEffect(() => {
    shouldPersistDraftOnUnmountRef.current = true;
    shouldRefocusAfterSendRef.current = false;
    focusInput();
  }, [chatId, focusInput]);

  useEffect(() => {
    if (!isLoadingSendMessage && shouldRefocusAfterSendRef.current) {
      shouldRefocusAfterSendRef.current = false;
      focusInput();
    }
  }, [focusInput, isLoadingSendMessage]);

  const handleMessageSubmit = form.handleSubmit(async (data) => {
    await onSubmit(
      data,
      files,
      forwardedMessages,
      editIdRef.current,
      filesEditedRef.current,
      false,
    );
  });

  return (
    <div className="mt-3">
      {hasFiles && (
        <FileList
          filesEdited={filesEdited}
          files={files}
          isLoadingSend={isLoadingSendFiles}
          onDeleteFile={onDeleteFile}
        />
      )}

      {forwardedMessages && forwardedMessages.length > 0 && (
        <ForwardedMessagesBar
          setForwardedMessages={setForwardedMessages}
          forwardedMessages={forwardedMessages}
        />
      )}

      <Form {...form}>
        <form
          onSubmit={(event) => {
            void handleMessageSubmit(event).catch(() => {});
          }}
          className="rounded-[30px] border border-border/60 bg-card/90 p-2 shadow-sm backdrop-blur"
        >
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="relative size-10 shrink-0 rounded-full"
            >
              <Input
                onChange={handleFileInputChange}
                type="file"
                title=""
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <Paperclip className="size-4" />
            </Button>

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="min-w-0 flex-1">
                  <FormControl>
                    <Textarea
                      {...field}
                      autoFocus
                      placeholder={t("writeMessage")}
                      rows={1}
                      ref={(node) => {
                        textareaRef.current = node;
                        field.ref(node);
                      }}
                      onChange={(event) => {
                        shouldPersistDraftOnUnmountRef.current = true;
                        field.onChange(event);
                      }}
                      onInput={() => {
                        syncTextareaHeight();
                        onTyping?.();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void handleMessageSubmit().catch(() => {});
                        }
                      }}
                      className="min-h-10 max-h-32 resize-none border-0 bg-transparent px-3 py-2 text-sm leading-6 shadow-none focus-visible:ring-0"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {editId && (
              <Button
                size="icon"
                variant="ghost"
                type="button"
                className="size-10 shrink-0 rounded-full"
                disabled={isBusy}
                onClick={handleCancelEdit}
              >
                <X className="size-4" />
              </Button>
            )}

            <Button
              size="icon"
              type="submit"
              className="size-10 shrink-0 rounded-full"
              disabled={!canSendMessage || isBusy}
              onMouseDown={(event) => event.preventDefault()}
              onPointerDown={(event) => event.preventDefault()}
            >
              {editId ? (
                <Check className="size-4" />
              ) : (
                <SendHorizonal className="size-4" />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SendMessageForm;
