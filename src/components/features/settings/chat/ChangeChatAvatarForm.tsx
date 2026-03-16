"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useChangeChatAvatarMutation,
  useRemoveChatAvatarMutation,
} from "@/shared/graphql/generated/output";
import { useCurrentChat } from "@/shared/hooks/useCurrentChat";
import {
  TypeUploadFileSchema,
  uploadFileSchema,
} from "@/shared/schemas/upload-file.schema";
import { Trash } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/common/Button";
import { Form, FormField } from "@/components/ui/common/Form";
import { Skeleton } from "@/components/ui/common/Skeleton";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import { FormWrapper } from "@/components/ui/elements/FormWrapper";

const ChangeChatAvatarForm = ({ chatId }: { chatId: string }) => {
  const t = useTranslations("settings");
  const tP = useTranslations("profileSettings");
  const { chat, isLoadingChat, refetch } = useCurrentChat(chatId);

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TypeUploadFileSchema>({
    resolver: zodResolver(uploadFileSchema),
    values: {
      file: chat?.avatarUrl!,
    },
  });

  const [update, { loading: isLoadingUpdateAvatar }] =
    useChangeChatAvatarMutation({
      onCompleted(data) {
        if (data?.changeChatAvatar) {
          refetch();
        }
        toast.success(tP("avatarUpdated"));
      },
      onError() {
        toast.error(tP("errorUpdatingAvatar"));
      },
    });

  const [remove, { loading: isLoadingRemoveAvatar }] =
    useRemoveChatAvatarMutation({
      onCompleted() {
        refetch();
        toast.success(tP("avatarRemoved"));
      },
      onError() {
        toast.error(tP("errorRemovingAvatar"));
      },
    });

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      form.setValue("file", file);
      update({
        variables: { avatar: file, chatId },
      });
    }
  }

  return isLoadingChat ? (
    <ChangeAvatarFormSkeleton />
  ) : (
    <FormWrapper heading={t("changeChatAvatar")}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <div className="px-5 pb-5">
              <div className="w-full items-center space-x-6 lg:flex">
                <EntityAvatar
                  size="xl"
                  avatarUrl={chat?.avatarUrl || null}
                  name={chat?.chatName}
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-x-3">
                    <input
                      className="hidden"
                      type="file"
                      ref={inputRef}
                      onChange={e => handleImageChange(e)}
                    />
                    <Button
                      className="mt-5 lg:mt-0"
                      variant="secondary"
                      onClick={() => inputRef.current?.click()}
                      disabled={isLoadingRemoveAvatar || isLoadingUpdateAvatar}
                    >
                      {chat?.avatarUrl
                        ? t("changeChatAvatar")
                        : tP("uploadAvatar")}
                    </Button>
                    {chat?.avatarUrl && (
                      <ConfirmModal
                        heading={tP("removeAvatar")}
                        message={t("removeChatAvatarConfirm")}
                        onConfirm={() => remove({ variables: { chatId } })}
                      >
                        <Button
                          className=""
                          variant="ghost"
                          disabled={
                            isLoadingRemoveAvatar || isLoadingUpdateAvatar
                          }
                          size="lgIcon"
                        >
                          <Trash className="size-4" />
                        </Button>
                      </ConfirmModal>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {chat?.avatarUrl
                      ? t("chatAvatarDesc")
                      : t("uploadChatAvatar")}
                  </p>
                </div>
              </div>
            </div>
          )}
        />
      </Form>
    </FormWrapper>
  );
};

export const ChangeAvatarFormSkeleton = () => {
  return <Skeleton className="h-52 w-full" />;
};
export default ChangeChatAvatarForm;
