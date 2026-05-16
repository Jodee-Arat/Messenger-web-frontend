import { zodResolver } from "@hookform/resolvers/zod";
import {
  useChangeChatAvatarMutation,
  useCreateChatMutation,
  useFindGroupByGroupIdQuery,
} from "@/shared/graphql/generated/output";
import { uploadFileSchema } from "@/shared/schemas/upload-file.schema";
import {
  createChatSchemaType,
  createChatSchemaFactory,
} from "@/shared/schemas/user/create-chat.schema";
import { SquarePen, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/Avatar";
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

interface CreateChatModalProp {
  groupId: string;
}

const CreateChatModal: FC<CreateChatModalProp> = ({ groupId }) => {
  const t = useTranslations("chats");
  const tValidation = useTranslations("validation");
  const schema = useMemo(
    () => createChatSchemaFactory(tValidation),
    [tValidation],
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { user: currentUser } = useCurrentUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    data,
    loading: isLoadingMembers,
    refetch,
  } = useFindGroupByGroupIdQuery({
    variables: { groupId },
    skip: !isOpen,
  });

  const form = useForm<createChatSchemaType>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      chatName: "",
      userIds: [],
      isSecretChat: false,
    },
  });

  const { isValid } = form.formState;
  const chatName = form.watch("chatName");

  const users = useMemo(
    () =>
      (data?.findGroupByGroupId?.members ?? [])
        .filter((m) => m.user.id !== currentUser?.id)
        .map((m) => m.user),
    [currentUser?.id, data?.findGroupByGroupId?.members],
  );

  const avatarPreviewUrl = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const [createChat, { loading: isLoadingCreate }] = useCreateChatMutation();
  const [changeChatAvatar, { loading: isLoadingAvatar }] =
    useChangeChatAvatarMutation();

  const resetModal = () => {
    form.reset();
    setAvatarFile(null);

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("avatarImageOnly"));
      event.target.value = "";
      return;
    }

    const result = uploadFileSchema.safeParse({ file });

    if (!result.success) {
      toast.error(t("avatarValidationError"));
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
  };

  const clearAvatar = () => {
    setAvatarFile(null);

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: createChatSchemaType) => {
    try {
      let avatarUploadError = "";

      const response = await createChat({
        variables: {
          groupId,
          data: {
            chatName: data.chatName,
            userIds: data.userIds,
            isGroup: true,
            isSecret: false,
          },
        },
      });

      const chatId = response.data?.createChat.id;

      if (!chatId) {
        throw new Error("Missing chat id");
      }

      if (avatarFile) {
        try {
          await changeChatAvatar({
            variables: {
              avatar: avatarFile,
              chatId,
            },
          });
        } catch (error) {
          avatarUploadError = error instanceof Error ? error.message : "";
        }
      }

      toast.success(t("chatCreated"));
      if (avatarUploadError) {
        toast.error(`${t("avatarUploadFailed")}${avatarUploadError}`);
      }
      setIsOpen(false);
      resetModal();
    } catch (error) {
      toast.error(
        `${t("createChatError")}${error instanceof Error ? error.message : ""}`,
      );
    }
  };

  const isSubmitting = isLoadingCreate || isLoadingAvatar;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetModal();
        } else {
          refetch();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="hover:bg-primary/30 p-0"
          size="lg"
          variant="ghost"
          asChild
        >
          <SquarePen className="size-7.5 p-0.5 px-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border/60 bg-background px-6 pb-4 pt-6 pr-12">
          <DialogTitle>{t("createChat")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="min-h-0 max-h-[calc(100dvh-10rem)] space-y-6 overflow-y-auto px-4 py-4 sm:max-h-[calc(100vh-16rem)] sm:px-6">
              <div className="space-y-3">
                <div>
                  <FormLabel>{t("chatAvatar")}</FormLabel>
                  <FormDescription>
                    {t("chatAvatarDescription")}
                  </FormDescription>
                </div>

                <div className="flex flex-col items-start gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center">
                  <Avatar className="size-20 shrink-0 self-center sm:self-auto">
                    {avatarPreviewUrl ? (
                      <AvatarImage
                        src={avatarPreviewUrl}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-2xl">
                      {chatName?.trim()?.[0]?.toUpperCase() ?? "C"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-full min-w-0 flex-1 space-y-3">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSubmitting}
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        {avatarFile ? t("changeAvatar") : t("uploadAvatar")}
                      </Button>
                      {avatarFile ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="lgIcon"
                          disabled={isSubmitting}
                          onClick={clearAvatar}
                        >
                          <Trash className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                    <p className="break-words text-sm leading-relaxed text-muted-foreground whitespace-normal">
                      {avatarFile?.name ?? t("chatAvatarOptional")}
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="chatName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("chatName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("chatNamePlaceholder")}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isLoadingMembers ? (
                <div className="flex items-center justify-center">
                  <span>{t("loadingUsers")}</span>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="userIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          {t("usersLabel")}
                        </FormLabel>
                        <FormDescription>
                          {t("selectUsersForChat")}
                        </FormDescription>
                      </div>
                      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                        {users.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="userIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
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
                                                (value) => value !== item.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="break-all text-sm font-normal">
                                    {item.username}
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
            </div>

            <div className="border-t border-border/60 bg-background px-4 py-4 sm:px-6">
              <Button
                className="w-full"
                disabled={!isValid || isSubmitting || isLoadingMembers}
                type="submit"
              >
                {t("submit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatModal;
