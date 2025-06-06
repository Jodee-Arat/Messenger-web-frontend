import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizonal } from "lucide-react";
import { FC, useRef } from "react";
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

import { useSendChatMessageMutation } from "@/graphql/generated/output";

import {
  SendMessageSchemaType,
  sendMessageSchema,
} from "@/schemas/chat/send-message.schema";

import { encryptTextDes } from "@/utils/crypto/des/encrypt-des";
import { encryptHashRsa } from "@/utils/crypto/rsa/encrypt-hash-rsa";
import { sha1Hash } from "@/utils/crypto/sha-1/sha-1-hash";

import { SendFileType } from "../../types/send-file.type";

import FileList from "./file/FileList";

interface SendMessageFormProp {
  chatId: string;
  keyD: bigint;
  keyN: bigint;
  sessionKey: bigint;
  files: SendFileType[];
  isLoadingSendFiles: boolean;
  handleClearFiles: () => void;
  onDeleteFile: (id: string) => void;
  clearMessageId: () => void;
  setErrorMessage: () => void;
}

const SendMessageForm: FC<SendMessageFormProp> = ({
  chatId,
  keyD,
  keyN,
  sessionKey,
  files,
  isLoadingSendFiles,
  handleClearFiles,
  onDeleteFile,
  clearMessageId,
  setErrorMessage,
}) => {
  const submitterRef = useRef<"fakeClient" | "real" | "fakeServer" | "null">(
    null
  );

  const form = useForm<SendMessageSchemaType>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  const [sendMessage, { loading: isLoadingSendMessage }] =
    useSendChatMessageMutation({
      onCompleted() {
        form.reset();
        handleClearFiles();
      },
      onError(error) {
        toast.error(error.message);
      },
    });

  const { isValid } = form.formState;

  const onSubmit = async (data: SendMessageSchemaType) => {
    if (data.message.trim() !== "") {
      let hash = "fakeHash";
      if (submitterRef.current !== "fakeClient") {
        hash = await sha1Hash(data.message);
      } else {
        setErrorMessage();
      }

      const encryptedHash = encryptHashRsa(hash, keyD, keyN);

      const encryptedMessage = encryptTextDes(
        sessionKey.toString(),
        data.message
      );
      const fileIds: string[] = [];
      if (files.length > 0) {
        files.forEach((file) => {
          if (file.id) {
            fileIds.push(file.id);
          } else {
            console.error("File ID is missing:", file);
            return;
          }
        });
      }
      console.log("Encrypted message for server:", encryptedMessage);
      console.log("Encrypted hash for server:", encryptedHash);

      sendMessage({
        variables: {
          data: {
            message: encryptedMessage! ?? null,
            hash: encryptedHash ?? null,
            isFake: submitterRef.current === "fakeServer",
            fileIds,
          },
          chatId,
        },
      });
      clearMessageId();
    } else {
      clearMessageId();
      const fileIds: string[] = [];
      if (files.length > 0) {
        files.forEach((file) => {
          if (file.id) {
            fileIds.push(file.id);
          } else {
            console.error("File ID is missing:", file);
            return;
          }
        });
      } else {
        form.reset();
        return;
      }

      sendMessage({
        variables: {
          data: {
            message: null,
            hash: null,
            isFake: submitterRef.current === "fakeServer",
            fileIds,
          },
          chatId,
        },
      });
    }
  };

  return (
    <>
      {files.length > 0 && (
        <FileList
          files={files}
          isLoadingSend={isLoadingSendFiles}
          onDeleteFile={onDeleteFile}
        />
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-3 flex items-center gap-x-4"
        >
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="w-[70%]">
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
                          form.handleSubmit(onSubmit)();
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
            size="default"
            type="submit"
            name="fakeServer"
            value="fakeServer"
            onClick={() => (submitterRef.current = "fakeServer")}
            disabled={!isValid || isLoadingSendMessage}
          >
            Fake server
          </Button>
          <Button
            size="default"
            type="submit"
            name="fakeClient"
            value="fakeClient"
            onClick={() => (submitterRef.current = "fakeClient")}
            disabled={!isValid || isLoadingSendMessage}
          >
            Fake client
          </Button>
          <Button
            name="real"
            value="real"
            size="icon"
            type="submit"
            onClick={() => (submitterRef.current = "real")}
            disabled={
              !(isValid || files.length !== 0) ||
              isLoadingSendMessage ||
              isLoadingSendFiles
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
