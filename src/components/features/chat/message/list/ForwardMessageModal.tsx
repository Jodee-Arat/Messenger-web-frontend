import { zodResolver } from "@hookform/resolvers/zod";
import {
  type FindAllChatsByUserQuery,
  useFindAllChatsByUserQuery,
  useForwardChatMessageMutation,
} from "@/shared/graphql/generated/output";
import { useUser } from "@/shared/hooks/useUser";
import {
  ForwardMessageSchemaType,
  forwardMessageSchema,
} from "@/shared/schemas/chat/forward-message.schema";
import {
  getDirectChatDisplayAvatar,
  getDirectChatDisplayName,
} from "@/shared/utils/direct-chat";
import { getChatRoute } from "@/shared/utils/chat-route";
import { cn } from "@/shared/utils/tw-merge";
import { useRouter } from "next/navigation";
import { FC, ReactElement, useState } from "react";
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
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

interface ForwardMessageModalProp {
  handleAddForwarded: (messageIds: string[]) => void;
  messageIds?: string[];
  handleClearMessagesId: () => void;
  chatId: string;
  trigger?: ReactElement;
}

type ChatItem = FindAllChatsByUserQuery["findAllChatsByUser"][0];

const getChatPreview = (chat: ChatItem, currentUserId?: string | null) => {
  if (chat.isGroup) {
    return {
      title: chat.chatName || "Chat",
      avatarUrl: chat.avatarUrl || null,
    };
  }

  return {
    title: getDirectChatDisplayName(chat, currentUserId),
    avatarUrl: getDirectChatDisplayAvatar(chat, currentUserId),
  };
};

const ForwardMessageModal: FC<ForwardMessageModalProp> = ({
  messageIds,
  handleClearMessagesId,
  handleAddForwarded,
  chatId,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const t = useTranslations("messages");
  const { userId } = useUser();
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
    mode: "onChange",
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
        const selectedChatId = form.getValues("targetChatsId")[0];
        if (form.getValues("targetChatsId").length === 1 && selectedChatId) {
          const selectedChat = chats.find((chat) => chat.id === selectedChatId);
          if (selectedChat) {
            router.push(
              getChatRoute({
                chatId: selectedChat.id,
                groupId: selectedChat.groupId,
                isGroup: selectedChat.isGroup,
              }),
            );
          }
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
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
        } else {
          refetch();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="default" className="rounded-full">
            {t("forward")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex h-[min(42rem,calc(100dvh-1rem))] max-h-[calc(100dvh-1rem)] flex-col gap-0 overflow-hidden border-border/60 bg-background/95 p-0 shadow-2xl backdrop-blur sm:h-[min(42rem,calc(100vh-2rem))] sm:max-h-[calc(100vh-2rem)] sm:max-w-md">
        <DialogHeader className="border-b border-border/60 bg-card/40 px-6 pb-4 pt-6 pr-12">
          <DialogTitle>{t("forwardMessages")}</DialogTitle>
          <DialogDescription>{""}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col gap-6 px-4 py-4 sm:px-6">
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
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <span>{t("loadingChats")}</span>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="targetChatsId"
                  render={() => (
                    <FormItem className="flex min-h-0 flex-1 flex-col">
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          {t("chatsLabel")}
                        </FormLabel>
                        <FormDescription>
                          {t("selectChatsToForward")}
                        </FormDescription>
                      </div>
                      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                        {chats.map((item) => {
                          const preview = getChatPreview(item, userId);

                          return (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="targetChatsId"
                              render={({ field }) => {
                                const isChecked =
                                  field.value?.includes(item.id) ?? false;

                                return (
                                  <FormItem
                                    key={item.id}
                                    className={cn(
                                      "flex flex-row items-center gap-3 rounded-2xl border px-3 py-3 transition-colors",
                                      isChecked
                                        ? "border-primary/35 bg-primary/8 shadow-sm"
                                        : "border-border/60 bg-card/35 hover:border-border hover:bg-accent/25",
                                    )}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                item.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-sm font-normal">
                                      <EntityAvatar
                                        size="lg"
                                        name={preview.title}
                                        avatarUrl={preview.avatarUrl}
                                      />
                                      <div className="min-w-0 flex flex-col space-y-1 text-start">
                                        <p className="truncate text-[15px] font-semibold text-foreground">
                                          {preview.title}
                                        </p>
                                        <div className="min-w-0">
                                          {item.draftMessages &&
                                          item.draftMessages.length > 0 &&
                                          item.draftMessages[0]?.text ? (
                                            <p className="truncate text-xs font-medium text-destructive">
                                              {item.draftMessages[0]?.text}
                                            </p>
                                          ) : item.draftMessages &&
                                            item.draftMessages.length > 0 &&
                                            item.draftMessages[0].files
                                              ?.length &&
                                            item.draftMessages[0].files.length >
                                              0 ? (
                                            <p className="truncate text-xs font-medium text-primary">
                                              {
                                                item.draftMessages[0].files
                                                  .length
                                              }{" "}
                                              {t("files")}
                                            </p>
                                          ) : item.lastMessage &&
                                            item.lastMessage?.text ? (
                                            <div className="flex min-w-0 items-center gap-2">
                                              <h5 className="truncate text-xs font-medium text-foreground/70">
                                                {item.lastMessage.user.username}
                                              </h5>
                                              <p className="text-muted-foreground truncate text-xs">
                                                {item.lastMessage?.text}
                                              </p>
                                            </div>
                                          ) : item.lastMessage &&
                                            item.lastMessage.files?.length &&
                                            item.lastMessage.files.length >
                                              0 ? (
                                            <div className="flex min-w-0 items-center gap-2">
                                              <h5 className="truncate text-xs font-medium text-foreground/70">
                                                {item.lastMessage.user.username}
                                              </h5>
                                              <p className="truncate text-xs font-medium text-primary">
                                                {item.lastMessage.files.length}{" "}
                                                {t("files")}
                                              </p>
                                            </div>
                                          ) : (
                                            <p className="text-muted-foreground truncate text-xs">
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
                          );
                        })}
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="border-t border-border/60 bg-card/40 px-4 py-4 sm:px-6">
              <Button
                className="w-full"
                disabled={
                  !isValid ||
                  isLoadingFindAllChatsByUser ||
                  isLoadingForwardingMessage
                }
                type="submit"
              >
                {t("forward")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardMessageModal;
