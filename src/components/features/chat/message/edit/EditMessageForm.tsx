import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizonal } from "lucide-react";
import { FC, use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/common/Form";
import { Textarea } from "@/components/ui/common/Textarea";

import { useEditChatMessageMutation } from "@/graphql/generated/output";

import {
  SendMessageSchemaType,
  sendMessageSchema,
} from "@/schemas/chat/send-message.schema";

import { SendFileType } from "../../types/send-file.type";

import ForwardedMessagesBar from "./ForwardedMessagesBar";
import FileList from "./file/FileList";
import { ForwardedMessageType } from "@/types/forward/forwarded-message.type";

interface SendMessageFormProp {
  editId: string | null;
  setEditId: (editId: string | null) => void;
  setText: (text: string) => void;
  text: string;
  forwardedMessages: ForwardedMessageType[];
  setForwardedMessages: (messages: ForwardedMessageType[]) => void;
  files: SendFileType[];
  setFiles: (files: SendFileType[]) => void;
  isLoadingSendFiles: boolean;
  clearMessageId: () => void;
  chatId: string;
}

const EditMessageForm: FC<SendMessageFormProp> = ({
  editId,
  setEditId,
  setText,
  chatId,
  files,
  isLoadingSendFiles,
  clearMessageId,
  forwardedMessages,
  setForwardedMessages,
  text,
  setFiles,
}) => {
  const form = useForm<SendMessageSchemaType>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      text: text ?? "",
    },
  });

  const [editMessage, { loading: isLoadingEditMessage }] =
    useEditChatMessageMutation({
      onCompleted() {
        form.reset();
        setFiles([]);
        setForwardedMessages([]);
        setEditId(null);
        setText("");
      },
      onError(error) {
        toast.error(error.message);
      },
    });

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  const canSendMessage =
    (form.watch("text")?.trim() ?? "") !== "" || files.length > 0;

  const onSubmit = async (
    data: SendMessageSchemaType,
    files: SendFileType[],
    forwardedMessages?: ForwardedMessageType[]
  ) => {
    const trimmedText = data.text ? data.text.trim() : "";
    const fileIds: string[] = [];

    if (files.length > 0) {
      files.forEach((file) => {
        if (file.id) {
          fileIds.push(file.id);
        } else {
          console.error("File ID is missing:", file);
        }
      });
    }

    if (trimmedText !== "" || fileIds.length > 0) {
      let forwardedMessageIds: string[] = forwardedMessages
        ? forwardedMessages.map((message) => message.id)
        : [];
      if (
        trimmedText === "" &&
        fileIds.length === 0 &&
        forwardedMessageIds.length === 0
      ) {
        return;
      }
      editMessage({
        variables: {
          data: {
            text: trimmedText !== "" ? trimmedText : null,
            forwardedMessageIds:
              forwardedMessageIds.length > 0 ? forwardedMessageIds : undefined,
            fileIds,
            targetChatId: chatId,
          },
          chatId,
          messageId: editId ?? "",
        },
      });

      setForwardedMessages([]);
      setFiles([]);
      setText("");
      setEditId(null);
      clearMessageId();
    }
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (
        value.text === "" &&
        files.length === 0 &&
        forwardedMessages.length === 0
      ) {
        setEditId(null);
        clearMessageId();
      }
    });

    return () => subscription.unsubscribe();
  }, [files.length, forwardedMessages.length]);

  return (
    <>
      {files.length > 0 && (
        <FileList
          files={files}
          isLoadingSend={isLoadingSendFiles}
          handleDeleteFile={handleDeleteFile}
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
            onSubmit(data, files, forwardedMessages)
          )}
          className="mt-3 flex items-center gap-x-4"
        >
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
                      disabled={isLoadingEditMessage}
                      onInput={(e) => {
                        e.currentTarget.style.height = "auto";
                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit((data) =>
                            onSubmit(data, files, forwardedMessages)
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

          <Button
            size="icon"
            type="submit"
            disabled={
              !canSendMessage || isLoadingSendFiles || isLoadingEditMessage
            }
          >
            <SendHorizonal className="size-4" />
          </Button>
        </form>
      </Form>
    </>
  );
};

export default EditMessageForm;
