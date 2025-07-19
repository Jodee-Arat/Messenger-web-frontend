import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import { Checkbox } from "@/components/ui/common/Checkbox";
import {
  Dialog,
  DialogContent,
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

import {
  useFindAllChatsByUserQuery,
  useForwardChatMessageMutation,
} from "@/graphql/generated/output";

import {
  ForwardMessageSchemaType,
  forwardMessageSchema,
} from "@/schemas/chat/forward-message.schema";

interface ForwardMessageModalProp {
  messageIds?: string[];
  handleClearMessagesId: () => void;
  chatId: string;
}

const ForwardMessageModal: FC<ForwardMessageModalProp> = ({
  messageIds,
  handleClearMessagesId,
  chatId,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
        toast.success("Message forwarded successfully.");
        setIsOpen(false);
        form.reset();
      },
      onError(error) {
        toast.error(`Error forwarding message: ${error.message}`);
      },
    });

  const onSubmit = (data: ForwardMessageSchemaType) => {
    if (!messageIds || messageIds.length === 0) {
      toast.error("No messages selected to forward.");
      return;
    }
    const targetChatsId = data.targetChatsId;
    if (targetChatsId.length === 0) {
      toast.error("You have to select at least one user.");
      return;
    }
    if (data.text && data.text.trim() === "") {
      toast.error("Message text cannot be empty.");
      return;
    }
    for (let targetChatId of targetChatsId) {
      forwardMessage({
        variables: {
          chatId,
          data: {
            forwardedMessageIds: messageIds,
            text: data.text ? data.text.trim() : "",
            fileIds: [],
            targetChatId,
          },
        },
      });
    }

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
        <Button className="" variant="default">
          Forward
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forward messages</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter message"
                      disabled={isLoadingForwardingMessage}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a message to the forwarded ones
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoadingFindAllChatsByUser ? (
              <div className="flex items-center justify-center">
                <span>Loading chats...</span>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="targetChatsId"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Chats</FormLabel>
                      <FormDescription>
                        Select chats to forward messages to.
                      </FormDescription>
                    </div>
                    <div className="space-y-5">
                      {chats.map((item) => (
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
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            item.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
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
                                          файл(ов)
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
                                            файл(ов)
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground text-xs">
                                          Пусто
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
              Forward
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardMessageModal;
