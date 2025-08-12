import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, SendHorizonal, X } from "lucide-react";
import { FC, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/common/Form";
import { Input } from "@/components/ui/common/Input";
import { Textarea } from "@/components/ui/common/Textarea";

import {
  useRemoveDraftMutation,
  useSendChatDraftMessageMutation,
  useSendChatMessageMutation,
} from "@/graphql/generated/output";

import {
  SendMessageSchemaType,
  sendMessageSchema,
} from "@/schemas/chat/send-message.schema";

import { haveItemsChangedById } from "@/utils/have-items-changedById";

import { SendFileType } from "../../types/send-file.type";

import ForwardedMessagesBar from "./ForwardedMessagesBar";
import FileList from "./file/FileList";
import { ForwardedMessageType } from "@/types/forward/forwarded-message.type";

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
}) => {
  const forwardedMessagesRef = useRef(forwardedMessages);
  const filesRef = useRef(files);
  const draftTextRef = useRef(draftText);
  const editIdRef = useRef(editId);
  const filesEditedRef = useRef(filesEdited);

  const form = useForm<SendMessageSchemaType>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      text: draftTextRef.current ?? "",
    },
  });

  const [sendMessage, { loading: isLoadingSendMessage }] =
    useSendChatMessageMutation({
      onCompleted() {
        forwardedMessagesRef.current = [];
        filesRef.current = [];
        draftTextRef.current = "";
        editIdRef.current = null;
        filesEditedRef.current = [];
        form.reset();
        handleClearForm();
      },
      onError(error) {
        toast.error(error.message);
      },
    });
  const [sendDraft, { loading: isLoadingSendDraft }] =
    useSendChatDraftMessageMutation({
      onCompleted() {
        forwardedMessagesRef.current = [];
        filesRef.current = [];
        draftTextRef.current = "";
        editIdRef.current = null;
        filesEditedRef.current = [];
        form.reset();
        handleClearForm();
      },
      onError(error) {
        toast.error(error.message);
      },
    });

  const [removeDraftMessage, { loading: isLoadingRemoveDraft }] =
    useRemoveDraftMutation({
      onCompleted() {
        forwardedMessagesRef.current = [];
        filesRef.current = [];
        draftTextRef.current = "";
        editIdRef.current = null;
        filesEditedRef.current = [];
        form.reset();
        handleClearForm();
      },
      onError(error) {
        toast.error(error.message);
      },
    });

  const canSendMessage =
    (form.watch("text")?.trim() ?? "") !== "" || files.length > 0;

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSend(file);
    }
  };

  const onSubmit = async (
    data: SendMessageSchemaType,
    files: SendFileType[],
    forwardedMessages?: ForwardedMessageType[],
    editId?: string | null,
    filesEdited: SendFileType[] = [],
    isDraft = false
  ) => {
    const trimmedText = data.text ? data.text.trim() : "";

    let forwardedMessageIds: string[] = forwardedMessages
      ? forwardedMessages.map((message) => message.id)
      : [];

    const filesId: string[] = files.map((file) => file.id);

    if (isDraft) {
      if (
        trimmedText === "" &&
        filesId.length === 0 &&
        forwardedMessageIds.length === 0
      ) {
        removeDraftMessage({
          variables: {
            chatId: chatId,
          },
        });
        return;
      }

      sendDraft({
        variables: {
          data: {
            editId: editId ?? undefined,
            text: trimmedText !== "" ? trimmedText : null,
            forwardedMessageIds:
              forwardedMessageIds.length > 0 ? forwardedMessageIds : undefined,
            fileIds: filesId,
            targetChatsId: [chatId],
          },
          chatId,
        },
      });
    } else {
      if (trimmedText !== "" || files.length > 0) {
        sendMessage({
          variables: {
            data: {
              editId: editId ?? undefined,
              text: trimmedText !== "" ? trimmedText : null,
              forwardedMessageIds:
                forwardedMessageIds.length > 0
                  ? forwardedMessageIds
                  : undefined,
              fileIds: filesId,
              targetChatsId: [chatId],
            },
            chatId,
          },
        });
      }

      setForwardedMessages([]);
      clearMessageId();
    }
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
  }, [forwardedMessages, files, draftText, editId, filesEdited]);

  useEffect(() => {
    return () => {
      const values = form.getValues();
      const isForwardedMessagesChanged = haveItemsChangedById(
        forwardedMessagesRef.current ?? [],
        forwardedMessages ?? []
      );
      const isFilesChanged = haveItemsChangedById(
        filesRef.current ?? [],
        files ?? []
      );
      const isTextChanged = values.text !== draftTextRef.current;

      if (!isForwardedMessagesChanged && !isFilesChanged && !isTextChanged) {
        return;
      }

      onSubmit(
        values,
        filesRef.current,
        forwardedMessagesRef.current,
        editIdRef.current,
        filesEditedRef.current,
        true
      );
    };
  }, []);

  return (
    <>
      {(files.length > 0 || filesEdited.length > 0) && (
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
          onSubmit={form.handleSubmit((data) =>
            onSubmit(
              data,
              files,
              forwardedMessages,
              editIdRef.current,
              filesEditedRef.current,
              false
            )
          )}
          className="mt-3 flex items-center gap-x-2"
        >
          <Button variant="ghost" className="relative overflow-hidden">
            <Input
              onChange={handleFileInputChange}
              type="file"
              title=""
              className="hover:none absolute left-0 top-0 h-full w-full opacity-0"
            />
            <Paperclip className="size-4" />
          </Button>

          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem className="w-[100%]">
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder="Send message"
                      rows={1}
                      disabled={isLoadingSendMessage}
                      onInput={(e) => {
                        e.currentTarget.style.height = "auto";
                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit((data) =>
                            onSubmit(
                              data,
                              files,
                              forwardedMessages,
                              editIdRef.current,
                              filesEditedRef.current,
                              false
                            )
                          )();
                        }
                      }}
                      className="border-border resize-none overflow-y-hidden border pr-8"
                      {...field}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {editId && (
            <Button
              size="icon"
              variant="secondary"
              type="button"
              disabled={
                !canSendMessage ||
                isLoadingSendMessage ||
                isLoadingSendFiles ||
                isLoadingRemoveDraft
              }
              onClick={(event) => {
                event.preventDefault();

                removeDraftMessage({
                  variables: {
                    chatId: chatId,
                  },
                });
              }}
            >
              <X className="size-4" />
            </Button>
          )}

          <Button
            size="icon"
            type="submit"
            disabled={
              !canSendMessage ||
              isLoadingSendMessage ||
              isLoadingSendFiles ||
              isLoadingRemoveDraft
            }
          >
            <SendHorizonal className="size-4" />
          </Button>
        </form>
      </Form>
    </>
  );
};

export default SendMessageForm;
