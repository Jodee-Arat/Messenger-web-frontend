"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import { Form, FormField } from "@/components/ui/common/Form";
import { Skeleton } from "@/components/ui/common/Skeleton";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import { FormWrapper } from "@/components/ui/elements/FormWrapper";

import {
  useChangeChatAvatarMutation,
  useRemoveChatAvatarMutation,
} from "@/graphql/generated/output";

import { useCurrentChat } from "@/hooks/useCurrentChat";

import {
  TypeUploadFileSchema,
  uploadFileSchema,
} from "@/schemas/upload-file.schema";

const ChangeChatAvatarForm = ({ chatId }: { chatId: string }) => {
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
        toast.success("Avatar updated successfully");
      },
      onError() {
        toast.error("Error updating avatar");
      },
    });

  const [remove, { loading: isLoadingRemoveAvatar }] =
    useRemoveChatAvatarMutation({
      onCompleted() {
        refetch();
        toast.success("Avatar removed successfully");
      },
      onError() {
        toast.error("Error removing avatar");
      },
    });

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      if (chat?.avatarUrl) {
        remove({
          variables: { chatId },
        });
      }
      form.setValue("file", file);
      update({
        variables: { avatar: file, chatId },
      });
    }
  }

  return isLoadingChat ? (
    <ChangeAvatarFormSkeleton />
  ) : (
    <FormWrapper heading="Change Avatar">
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
                      onChange={(e) => handleImageChange(e)}
                    />
                    <Button
                      className="mt-5 lg:mt-0"
                      variant="secondary"
                      onClick={() => inputRef.current?.click()}
                      disabled={isLoadingRemoveAvatar || isLoadingUpdateAvatar}
                    >
                      {chat?.avatarUrl ? "Change Avatar" : "Upload Avatar"}
                    </Button>
                    {chat?.avatarUrl && (
                      <ConfirmModal
                        heading="Remove Avatar"
                        message="Are you sure you want to remove avatar chat?"
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
                      ? "Click to change your chat avatar"
                      : "Upload a new avatar for your chat"}
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
