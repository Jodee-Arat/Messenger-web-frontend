import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFindAllChatsByUserQuery,
  useForwardChatMessageMutation,
} from "@/shared/graphql/generated/output";
import {
  ForwardMessageSchemaType,
  forwardMessageSchema,
} from "@/shared/schemas/chat/forward-message.schema";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/common/Button";
import { Checkbox } from "@/components/ui/common/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/common/Dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/common/Form";
import { Input } from "@/components/ui/common/Input";

interface ForwardMessageModalProp {
  handleAddForwarded: (messageIds: string[]) => void;
  messageIds?: string[];
  handleClearMessagesId: () => void;
  chatId: string;
}

const ForwardMessageModal: FC<ForwardMessageModalProp> = ({
  messageIds,
  handleClearMessagesId,
  handleAddForwarded,
  chatId,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const t = useTranslations("messages");

  const router = useRouter();

  const {
    data: dataChats,
    loading: isLoadingFindAllChatsByUser,
    refetch,
  } = useFindAllChatsByUserQuery({
    skip: !isOpen,
    variables: {
      filters: {},
    },
  });

  const form = useForm<ForwardMessageSchemaType>({
    resolver: zodResolver(forwardMessageSchema),
    defaultValues: {
      text: "",
      targetChatsId: [],
    },
  });

  const { isValid } = form.formState;

  const chats = dataChats?.findAllChatsByUser ?? [];

  const [forwardMessage, { loading: isLoadingForwardingMessage }] =
    useForwardChatMessageMutation({
      onCompleted() {
        setIsOpen(false);
        if (form.getValues("targetChatsId").length === 1) {
          router.push(`/chat/${form.getValues("targetChatsId")[0]}`);
        }
        toast.success(t("messageForwarded"));
        form.reset();
      },
      onError(error) {
        toast.error(t("forwardError") + ": " + error.message);
      },
    });

  const onSubmit = (data: ForwardMessageSchemaType) => {
    if (!messageIds || messageIds.length === 0) {
      toast.error(t("noMessagesSelected"));
      return;
    }
    const targetChatsId = data.targetChatsId;
    if (targetChatsId.length === 0) {
      toast.error(t("selectAtLeastOneUser"));
      return;
    }
    if (data.text && data.text.trim() === "") {
      toast.error(t("messageTextEmpty"));
      return;
    }

    if (targetChatsId.length === 1 && targetChatsId[0] === chatId) {
      handleAddForwarded(messageIds);
      handleClearMessagesId();
      return;
    }

    forwardMessage({
      variables: {
        chatId,
        data: {
          forwardedMessageIds: messageIds,
          text: data.text ? data.text.trim() : "",
          fileIds: [],
          targetChatsId,
        },
      },
    });

    handleClearMessagesId();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (!open) {
          form.reset();
        } else {
          refetch();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="" variant="default">
          {t("forward")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("forwardMessages")}</DialogTitle>
          <DialogDescription>{""}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("messageLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("enterMessagePlaceholder")}
                      disabled={isLoadingForwardingMessage}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("writeMessageToForward")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoadingFindAllChatsByUser ? (
              <div className="flex items-center justify-center">
                <span>{t("loadingChats")}</span>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="targetChatsId"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        {t("chatsLabel")}
                      </FormLabel>
                      <FormDescription>
                        {t("selectChatsToForward")}
                      </FormDescription>
                    </div>
                    <div className="space-y-5">
                      {chats.map(item => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="targetChatsId"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-center space-x-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={checked => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            item.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              value => value !== item.id,
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="flex items-center space-x-4 text-sm font-normal">
                                  <Image
                                    src={"/images/avatar/rostik.jpg"}
                                    alt="frontend"
                                    width={40}
                                    height={40}
                                    className="size-15 rounded-full object-cover object-top"
                                  />
                                  <div className="flex flex-col space-y-1 text-start">
                                    <p className="text-[16px]">
                                      {item.chatName}
                                    </p>
                                    <div>
                                      {item.draftMessages &&
                                      item.draftMessages.length > 0 &&
                                      item.draftMessages[0]?.text ? (
                                        <p className="text-xs text-red-500">
                                          {item.draftMessages[0]?.text}
                                        </p>
                                      ) : item.draftMessages &&
                                        item.draftMessages.length > 0 &&
                                        item.draftMessages[0].files?.length &&
                                        item.draftMessages[0].files.length >
                                          0 ? (
                                        <p className="text-xs text-blue-400">
                                          {item.draftMessages[0].files.length}{" "}
                                          {t("files")}
                                        </p>
                                      ) : item.lastMessage &&
                                        item.lastMessage?.text ? (
                                        <div className="flex items-center space-x-2">
                                          <h5 className="text-primary-foreground/80">
                                            {item.lastMessage.user.username}
                                          </h5>
                                          <p className="text-muted-foreground text-xs">
                                            {item.lastMessage?.text}
                                          </p>
                                        </div>
                                      ) : item.lastMessage &&
                                        item.lastMessage.files?.length &&
                                        item.lastMessage.files.length > 0 ? (
                                        <div className="flex items-center space-x-2">
                                          <h5 className="text-primary-foreground/80">
                                            {item.lastMessage.user.username}
                                          </h5>
                                          <p className="text-xs text-blue-400">
                                            {item.lastMessage.files.length}{" "}
                                            {t("files")}
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground text-xs">
                                          {t("empty")}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              disabled={
                !isValid ||
                isLoadingFindAllChatsByUser ||
                isLoadingForwardingMessage
              }
              type="submit"
            >
              {t("forward")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardMessageModal;
